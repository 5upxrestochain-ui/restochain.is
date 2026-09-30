import { randomUUID } from "node:crypto";
import {
  applyAction,
  initialState,
  type Action,
  type Role,
  type State,
} from "../src/domain.ts";
import {
  checkPassword,
  digest,
  equalSecret,
  hashPassword,
  sessionToken,
} from "./auth.ts";
import { query, type Database } from "./db.ts";

export type Config = {
  origin: string;
  allowRegistration: boolean;
  signupCode: string;
  secureCookie: boolean;
};
type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  state_json: string;
  revision: number;
};
type UserRow = {
  id: string;
  workspace_id: string;
  email: string;
  name: string;
  role: Role;
  password_hash: string;
};
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
const text = (value: unknown, label: string, max = 100) => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    return fail(400, `${label} không hợp lệ.`);
  return value.trim();
};
const emailOf = (value: unknown) => {
  const email = text(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail(400, "Email không hợp lệ.");
  return email;
};
const passwordOf = (value: unknown, creating = false) => {
  if (
    typeof value !== "string" ||
    value.length > 128 ||
    value.length < (creating ? 12 : 1)
  )
    return fail(400, "Mật khẩu cần 12–128 ký tự khi tạo tài khoản.");
  return value;
};

/** Only occupancy and catalog data leave this function; never customer identities. */
export function publicState(s: State): State {
  return {
    version: 1,
    businessName: s.businessName,
    venues: s.venues,
    tables: s.tables,
    products: s.products.map((p) => ({ ...p, bom: [] })),
    ingredients: [],
    orders: [],
    customers: [],
    shifts: [],
    audit: [],
    resolvedAlerts: [],
    bookings: s.bookings
      .filter(
        (b) =>
          b.status !== "cancelled" &&
          Date.parse(`${b.date}T${b.time}:00+07:00`) + b.duration * 60000 >=
            Date.now() &&
          (b.status !== "pending" ||
            Date.now() - Date.parse(b.createdAt) <= 1800000),
      )
      .map((b, i) => ({
        id: `occupied-${i}`,
        venueId: b.venueId,
        tableId: b.tableId,
        date: b.date,
        time: b.time,
        duration: b.duration,
        status: b.status,
        createdAt: b.createdAt,
        name: "",
        phone: "",
        need: "",
        note: "",
        guests: 0,
        items: [],
        total: 0,
      })),
  };
}

export function createApp(db: Database | null, config: Config) {
  return async function app(request: Request): Promise<Response> {
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });
    const cookieName = config.secureCookie
      ? "__Host-restochain_session"
      : "restochain_session";
    const cookie =
      request.headers
        .get("cookie")
        ?.split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith(cookieName + "="))
        ?.slice(cookieName.length + 1) || "";
    const setCookie = (value: string, seconds: number) =>
      headers.set(
        "Set-Cookie",
        `${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${seconds}${config.secureCookie ? "; Secure" : ""}`,
      );
    try {
      const url = new URL(request.url),
        op = url.searchParams.get("op") || "";
      if (op === "health" && request.method === "GET")
        return json({ configured: !!db, version: "1.0.0" });
      if (!db) {
        if (op === "session" && request.method === "GET")
          return json({ user: null, configured: false });
        fail(
          503,
          "Máy chủ chưa được cấu hình. Bạn vẫn có thể dùng bản trải nghiệm.",
        );
      }
      const database = db!;
      const getOps = ["session", "state", "public"];
      const postOps = ["signup", "login", "logout", "mutate", "book", "member"];
      if (![...getOps, ...postOps].includes(op))
        fail(404, "Không tìm thấy chức năng.");
      if (
        (getOps.includes(op) && request.method !== "GET") ||
        (postOps.includes(op) && request.method !== "POST")
      )
        fail(405, "Phương thức không được hỗ trợ.");
      let body: Record<string, unknown> = {};
      if (request.method === "POST") {
        if (!config.origin || request.headers.get("origin") !== config.origin)
          fail(403, "Nguồn gửi yêu cầu không hợp lệ.");
        if (
          !request.headers.get("content-type")?.startsWith("application/json")
        )
          fail(415, "Yêu cầu cần định dạng JSON.");
        if (Number(request.headers.get("content-length") || 0) > 65536)
          fail(413, "Yêu cầu quá lớn.");
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > 65536)
          fail(413, "Yêu cầu quá lớn.");
        try {
          body = JSON.parse(raw);
        } catch {
          fail(400, "JSON không hợp lệ.");
        }
        if (!body || Array.isArray(body) || typeof body !== "object")
          fail(400, "Nội dung không hợp lệ.");
      }
      // Vercel supplies x-forwarded-for at its trusted edge. Never accept an IP in the JSON body.
      const ip = (request.headers.get("x-forwarded-for") || "unknown")
        .split(",")[0]
        .trim();
      async function limit(scope: string, maximum: number, seconds: number) {
        const now = Date.now(),
          bucket = Math.floor(now / (seconds * 1000));
        const key = digest(`${scope}:${ip}:${bucket}`);
        const rows = await query(
          database,
          "INSERT INTO rate_limits (key, hits, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = hits + 1 RETURNING hits",
          [key, now + seconds * 2000],
        );
        if (Number(rows[0]?.hits) > maximum)
          fail(429, "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.");
      }
      async function workspace(
        id: string,
        bySlug = false,
      ): Promise<WorkspaceRow> {
        const rows = await query(
          database,
          `SELECT id, slug, name, state_json, revision FROM workspaces WHERE ${bySlug ? "slug" : "id"} = ?`,
          [id],
        );
        if (!rows.length) fail(404, "Không tìm thấy không gian doanh nghiệp.");
        return rows[0] as WorkspaceRow;
      }
      async function auth(): Promise<UserRow | null> {
        if (!/^[a-f0-9]{64}$/.test(cookie)) return null;
        const rows = await query(
          database,
          "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?",
          [digest(cookie), Date.now()],
        );
        return (rows[0] as UserRow) || null;
      }
      const safeUser = (u: UserRow, w: WorkspaceRow) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        slug: w.slug,
      });
      async function issueSession(u: UserRow) {
        const token = sessionToken(),
          now = Date.now();
        await database.batch([
          { sql: "DELETE FROM sessions WHERE expires_at <= ?", params: [now] },
          {
            sql: "DELETE FROM rate_limits WHERE expires_at <= ?",
            params: [now],
          },
          {
            sql: "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
            params: [digest(token), u.id, now + 8 * 3600000],
          },
        ]);
        setCookie(token, 8 * 3600);
        const w = await workspace(u.workspace_id);
        return json({
          user: safeUser(u, w),
          state: JSON.parse(w.state_json),
          revision: w.revision,
        });
      }
      async function save(w: WorkspaceRow, next: State) {
        const raw = JSON.stringify(next);
        if (Buffer.byteLength(raw) > 1000000)
          fail(
            413,
            "Không gian đạt giới hạn dữ liệu của bản MVP. Cần nâng cấp lưu trữ trước khi thêm dữ liệu.",
          );
        // Optimistic concurrency: one SQL statement commits orders, stock and audit together.
        return (
          (
            await query(
              database,
              "UPDATE workspaces SET state_json = ?, name = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ? RETURNING revision",
              [raw, next.businessName, Date.now(), w.id, w.revision],
            )
          ).length > 0
        );
      }
      function reduce(state: State, action: Action, name: string, role: Role) {
        try {
          return applyAction(state, action, name, role);
        } catch (e) {
          return fail(
            400,
            e instanceof Error ? e.message : "Dữ liệu không hợp lệ.",
          );
        }
      }
      if (op === "public") {
        await limit("public", 60, 60);
        const w = await workspace(
          text(url.searchParams.get("slug"), "Đường dẫn", 80),
          true,
        );
        return json({ state: publicState(JSON.parse(w.state_json)) });
      }
      if (op === "book") {
        await limit("book", 8, 600);
        if (body.consent !== true)
          fail(400, "Cần đồng ý cung cấp thông tin để xử lý đặt bàn.");
        const slug = text(body.slug, "Đường dẫn", 80);
        if (
          !body.payload ||
          typeof body.payload !== "object" ||
          Array.isArray(body.payload)
        )
          fail(400, "Thiếu thông tin đặt bàn.");
        const payload = body.payload as Record<string, unknown>;
        const id = randomUUID(); // A public client cannot choose an existing private booking ID.
        for (let attempt = 0; attempt < 3; attempt++) {
          const w = await workspace(slug, true),
            state = JSON.parse(w.state_json) as State;
          const next = reduce(
            state,
            { type: "BOOKING_CREATE", payload: { ...payload, id } },
            "Khách đặt bàn",
            "staff",
          );
          if (await save(w, next))
            return json(
              { booking: next.bookings.find((b) => b.id === id) },
              201,
            );
        }
        fail(409, "Lịch bàn vừa thay đổi. Vui lòng tải lại và chọn bàn.");
      }
      if (op === "signup") {
        await limit("signup", 5, 900);
        if (!config.allowRegistration || config.signupCode.length < 16)
          fail(
            403,
            "Đăng ký hiện chưa mở. Chủ dự án cần bật đăng ký trong cấu hình máy chủ.",
          );
        if (
          typeof body.code !== "string" ||
          body.code.length > 200 ||
          !equalSecret(body.code, config.signupCode)
        )
          fail(403, "Mã tạo doanh nghiệp không hợp lệ.");
        const email = emailOf(body.email),
          password = passwordOf(body.password, true);
        const name = text(body.name, "Họ tên", 80),
          businessName = text(body.businessName, "Doanh nghiệp", 80);
        const existing = await query(
          database,
          "SELECT id FROM users WHERE email = ?",
          [email],
        );
        if (existing.length)
          fail(409, "Không thể tạo tài khoản với email này. Hãy đăng nhập.");
        const id = randomUUID(),
          uid = randomUUID(),
          slug = "rc-" + randomUUID().slice(0, 12);
        const hash = await hashPassword(password),
          now = Date.now();
        await database.batch([
          {
            sql: "INSERT INTO workspaces (id, slug, name, state_json, revision, updated_at) VALUES (?, ?, ?, ?, 0, ?)",
            params: [
              id,
              slug,
              businessName,
              JSON.stringify(initialState(false, businessName)),
              now,
            ],
          },
          {
            sql: "INSERT INTO users (id, workspace_id, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            params: [uid, id, email, name, "owner", hash, now],
          },
        ]);
        return await issueSession({
          id: uid,
          workspace_id: id,
          email,
          name,
          role: "owner",
          password_hash: hash,
        });
      }
      if (op === "login") {
        await limit("login", 12, 900);
        const email = emailOf(body.email),
          password = passwordOf(body.password);
        const rows = await query(
          database,
          "SELECT * FROM users WHERE email = ?",
          [email],
        );
        const u = rows[0] as UserRow | undefined;
        // Equal-cost dummy derivation for an unknown email.
        const hash =
          u?.password_hash ||
          "scrypt$00000000000000000000000000000000$" + "0".repeat(128);
        if (!(await checkPassword(password, hash)) || !u)
          fail(401, "Email hoặc mật khẩu không đúng.");
        return await issueSession(u!);
      }
      if (op === "logout") {
        if (cookie)
          await query(database, "DELETE FROM sessions WHERE token_hash = ?", [
            digest(cookie),
          ]);
        setCookie("", 0);
        return json({ ok: true });
      }
      const user = await auth();
      if (!user) {
        if (op === "session") return json({ user: null, configured: true });
        fail(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
      const u = user!;
      if (op === "member") {
        if (u.role !== "owner")
          fail(403, "Chỉ chủ doanh nghiệp được tạo tài khoản.");
        await limit("member", 10, 600);
        const email = emailOf(body.email),
          name = text(body.name, "Họ tên", 80);
        const role = body.role;
        if (role !== "manager" && role !== "staff")
          fail(400, "Vai trò không hợp lệ.");
        if (
          (
            await query(database, "SELECT id FROM users WHERE email = ?", [
              email,
            ])
          ).length
        )
          fail(409, "Email đã được sử dụng.");
        const hash = await hashPassword(passwordOf(body.password, true));
        await query(
          database,
          "INSERT INTO users (id, workspace_id, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            randomUUID(),
            u.workspace_id,
            email,
            name,
            String(role),
            hash,
            Date.now(),
          ],
        );
        return json({ ok: true }, 201);
      }
      const w = await workspace(u.workspace_id),
        state = JSON.parse(w.state_json) as State;
      if (op === "state" || op === "session")
        return json({ user: safeUser(u, w), state, revision: w.revision });
      if (op === "mutate") {
        if (
          !Number.isSafeInteger(body.revision) ||
          body.revision !== w.revision
        )
          fail(
            409,
            "Dữ liệu vừa được cập nhật ở thiết bị khác. Đã tải bản mới; vui lòng kiểm tra rồi thử lại.",
          );
        const action = body.action as Action;
        if (
          !action ||
          typeof action.type !== "string" ||
          !action.payload ||
          typeof action.payload !== "object" ||
          Array.isArray(action.payload)
        )
          fail(400, "Thao tác không hợp lệ.");
        const next = reduce(state, action, u.name, u.role);
        if (next === state) return json({ state, revision: w.revision });
        if (!(await save(w, next)))
          fail(
            409,
            "Có thao tác đồng thời. Vui lòng kiểm tra dữ liệu mới trước khi thử lại.",
          );
        return json({ state: next, revision: w.revision + 1 });
      }
      return json({ error: "Không tìm thấy chức năng." }, 404);
    } catch (error) {
      if (error instanceof HttpError)
        return json({ error: error.message }, error.status);
      return json(
        {
          error:
            "Chưa thể kết nối cơ sở dữ liệu. Kiểm tra cấu hình hoặc thử lại sau.",
        },
        503,
      );
    }
  };
}
