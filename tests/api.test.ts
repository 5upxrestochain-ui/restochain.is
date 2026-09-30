import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createApp, publicState, type Config } from "../server/app.ts";
import { initialState, dayOffset } from "../src/domain.ts";
import type { Database, Statement, Result } from "../server/db.ts";

// Executes the actual SQL against SQLite; it does not emulate a live Cloudflare service.
class TestDatabase implements Database {
  sqlite = new DatabaseSync(":memory:");
  constructor() {
    this.sqlite.exec(
      readFileSync(new URL("../server/schema.sql", import.meta.url), "utf8"),
    );
  }
  async batch(statements: Statement[]): Promise<Result[]> {
    this.sqlite.exec("BEGIN");
    try {
      const result = statements.map((s) => ({
        results: this.sqlite.prepare(s.sql).all(...(s.params || [])) as Record<
          string,
          unknown
        >[],
        success: true,
      }));
      this.sqlite.exec("COMMIT");
      return result;
    } catch (e) {
      this.sqlite.exec("ROLLBACK");
      throw e;
    }
  }
}
const origin = "https://restochain.example";
const config: Config = {
  origin,
  allowRegistration: true,
  signupCode: "only-a-local-test-code-123",
  secureCookie: true,
};
const pass = "Only-a-test-password-123";
function fixture() {
  const db = new TestDatabase(),
    app = createApp(db, config);
  async function call(
    op: string,
    body?: unknown,
    cookie = "",
    extra: Record<string, string> = {},
  ) {
    const response = await app(
      new Request(origin + "/api/restochain?op=" + op, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          origin,
          "Content-Type": "application/json",
          cookie,
          "x-forwarded-for": "192.0.2.1",
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
    return {
      status: response.status,
      data: await response.json(),
      cookie: (response.headers.get("set-cookie") || "").split(";")[0],
      headers: response.headers,
    };
  }
  const register = (email = "owner@example.test") =>
    call("signup", {
      email,
      name: "Người kiểm thử",
      businessName: "Quán kiểm thử",
      password: pass,
      code: config.signupCode,
    });
  return { db, call, register };
}
test("Chưa cấu hình vẫn mở được demo; API dùng chung trả lỗi rõ ràng", async () => {
  const app = createApp(null, config);
  const session = await app(new Request(origin + "/api/restochain?op=session"));
  assert.deepEqual(await session.json(), { user: null, configured: false });
  assert.equal(
    (await app(new Request(origin + "/api/restochain?op=state"))).status,
    503,
  );
});
test("Đăng ký có mã riêng, mật khẩu được băm, cookie bảo vệ và đăng xuất vô hiệu hóa phiên", async () => {
  const { db, call, register } = fixture();
  const blocked = await call("signup", {
    email: "blocked@example.test",
    name: "Thử",
    businessName: "Thử",
    password: pass,
    code: "wrong-code",
  });
  assert.equal(blocked.status, 403);
  const owner = await register();
  assert.equal(owner.status, 200);
  assert.ok(
    owner.headers
      .get("set-cookie")
      ?.includes("HttpOnly; SameSite=Lax; Path=/; Max-Age=28800; Secure"),
  );
  const row = db.sqlite.prepare("SELECT password_hash FROM users").get()!;
  assert.match(String(row.password_hash), /^scrypt\$/);
  assert.ok(!String(row.password_hash).includes(pass));
  assert.equal((await call("state", undefined, owner.cookie)).status, 200);
  assert.equal((await call("logout", {}, owner.cookie)).status, 200);
  assert.equal((await call("state", undefined, owner.cookie)).status, 401);
  assert.equal(
    (await call("login", { email: "owner@example.test", password: pass }))
      .status,
    200,
  );
  assert.equal(
    (await call("login", { email: "owner@example.test", password: "wrong" }))
      .status,
    401,
  );
  db.sqlite.close();
});
test("Từ chối POST khác nguồn, tách dữ liệu hai doanh nghiệp và chặn ghi phiên bản cũ", async () => {
  const { db, call, register } = fixture();
  const a = await register("a@example.test"),
    b = await register("b@example.test");
  assert.notEqual(a.data.user.slug, b.data.user.slug);
  const action = {
    type: "SETTINGS_SAVE",
    payload: {
      businessName: "Tên riêng doanh nghiệp A",
      workspaceId: b.data.user.id,
    },
  };
  assert.equal(
    (
      await call("mutate", { revision: 0, action }, a.cookie, {
        origin: "https://attacker.example",
      })
    ).status,
    403,
  );
  const result = await call("mutate", { revision: 0, action }, a.cookie);
  assert.equal(result.status, 200);
  assert.equal(
    (await call("mutate", { revision: 0, action }, a.cookie)).status,
    409,
  );
  assert.equal(
    (await call("state", undefined, b.cookie)).data.state.businessName,
    "Quán kiểm thử",
  );
  db.sqlite.close();
});
test("Hai thao tác đồng thời chỉ một lần ghi kho được chấp nhận", async () => {
  const { db, call, register } = fixture(),
    owner = await register();
  const body = {
    revision: 0,
    action: {
      type: "STOCK_ADJUST",
      payload: {
        id: "i1",
        venueId: "v1",
        direction: "in",
        quantity: 1,
        reason: "Kiểm thử đồng thời",
      },
    },
  };
  const results = await Promise.all([
    call("mutate", body, owner.cookie),
    call("mutate", body, owner.cookie),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const state = (await call("state", undefined, owner.cookie)).data.state;
  assert.equal(
    state.ingredients.find((i: { id: string }) => i.id === "i1").stock,
    1,
  );
  assert.equal(state.audit.length, 1);
  db.sqlite.close();
});
test("Phân quyền được thực thi trên API, không chỉ bằng nút trên giao diện", async () => {
  const { db, call, register } = fixture(),
    owner = await register();
  const member = await call(
    "member",
    {
      name: "Nhân viên",
      email: "staff@example.test",
      password: pass,
      role: "staff",
    },
    owner.cookie,
  );
  assert.equal(member.status, 201);
  const staff = await call("login", {
    email: "staff@example.test",
    password: pass,
  });
  assert.equal(
    (
      await call(
        "member",
        {
          name: "Lạ",
          email: "no@example.test",
          password: pass,
          role: "manager",
        },
        staff.cookie,
      )
    ).status,
    403,
  );
  const result = await call(
    "mutate",
    {
      revision: 0,
      action: {
        type: "STOCK_ADJUST",
        payload: {
          id: "i1",
          venueId: "v1",
          direction: "in",
          quantity: 2,
          reason: "Thử",
        },
      },
    },
    staff.cookie,
  );
  assert.equal(result.status, 400);
  assert.match(result.data.error, /không có quyền/);
  db.sqlite.close();
});
test("Đặt bàn công khai không lộ dữ liệu riêng, giá do máy chủ tính, chống đặt trùng", async () => {
  const { db, call, register } = fixture(),
    owner = await register(),
    slug = owner.data.user.slug;
  const payload = {
    id: "client-cannot-choose-id",
    venueId: "v1",
    tableId: "v1-t1",
    name: "Khách bí mật",
    phone: "0900000088",
    note: "Ghi chú riêng",
    guests: 2,
    date: dayOffset(1),
    time: "10:00",
    items: [{ productId: "p1", quantity: 2, price: 1 }],
  };
  const booked = await call("book", { slug, payload, consent: true });
  assert.equal(booked.status, 201);
  assert.equal(booked.data.booking.total, 90000);
  assert.notEqual(booked.data.booking.id, payload.id);
  const publicResult = await call("public&slug=" + slug),
    raw = JSON.stringify(publicResult.data);
  for (const secret of [
    "Khách bí mật",
    "0900000088",
    "Ghi chú riêng",
    "owner@example.test",
  ])
    assert.ok(!raw.includes(secret));
  assert.equal(publicResult.data.state.bookings.length, 1);
  assert.equal(publicResult.data.state.products[0].bom.length, 0);
  assert.equal(
    (await call("book", { slug, payload, consent: true })).status,
    400,
  );
  const internal = await call("state", undefined, owner.cookie);
  assert.equal(internal.data.state.bookings[0].phone, "0900000088");
  assert.equal(internal.data.revision, 1);
  db.sqlite.close();
});
test("Danh mục công khai loại cả khách hàng, kho, nhân viên và nhật ký", () => {
  const s = publicState(initialState());
  for (const key of [
    "customers",
    "ingredients",
    "orders",
    "shifts",
    "audit",
  ] as const)
    assert.equal(s[key].length, 0);
});
