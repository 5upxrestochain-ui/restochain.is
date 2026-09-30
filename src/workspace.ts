import { useEffect, useRef, useState } from "react";
import {
  applyAction,
  initialState,
  type Action,
  type Role,
  type State,
} from "./domain";
const KEY = "restochain-demo-v1";
export type User = {
  id: string;
  name: string;
  role: Role;
  email: string;
  slug: string;
};
export async function api(op: string, body?: unknown, query = "") {
  const res = await fetch(
    "/api/restochain?op=" + encodeURIComponent(op) + query,
    {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    },
  );
  const type = res.headers.get("content-type") || "";
  if (!type.includes("application/json"))
    throw Error(
      "Máy chủ chưa được cấu hình. Bạn vẫn có thể dùng bản trải nghiệm.",
    );
  const data = await res.json();
  if (!res.ok)
    throw Error(data.error || "Không thể thực hiện. Vui lòng thử lại.");
  return data;
}
function readDemo(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (
        s.version === 1 &&
        typeof s.businessName === "string" &&
        [
          "orders",
          "venues",
          "audit",
          "ingredients",
          "products",
          "bookings",
          "tables",
          "customers",
          "shifts",
          "resolvedAlerts",
        ].every((key) => Array.isArray(s[key])) &&
        s.venues.length > 0
      )
        return s;
    }
  } catch {
    /* Demo storage may be unavailable. */
  }
  return initialState();
}
export function useWorkspace() {
  const [state, setState] = useState<State>(readDemo),
    [user, setUser] = useState<User | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [online, setOnline] = useState(navigator.onLine);
  const current = useRef(state),
    userRef = useRef(user);
  const [revision, setRevision] = useState(0);
  const revRef = useRef(0);
  const lock = useRef(false);
  current.current = state;
  userRef.current = user;
  revRef.current = revision;
  function notify(message: string) {
    setNotice(message);
  }
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    api("session")
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setState(d.state);
          setRevision(d.revision);
        }
      })
      .catch(() => {});
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      if (lock.current || document.hidden) return;
      api("state")
        .then((d) => {
          if (!lock.current && d.revision > revRef.current) {
            setState(d.state);
            setRevision(d.revision);
          }
        })
        .catch(() => {});
    }, 45000);
    return () => clearInterval(timer);
  }, [user]);
  async function dispatch(action: Action) {
    if (lock.current) throw Error("Đang lưu thao tác trước, vui lòng chờ.");
    lock.current = true;
    setBusy(true);
    try {
      if (userRef.current) {
        const d = await api("mutate", { action, revision: revRef.current });
        setState(d.state);
        setRevision(d.revision);
        current.current = d.state;
        revRef.current = d.revision;
        return d.state as State;
      }
      const next = applyAction(current.current, action);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        throw Error(
          "Không thể lưu trên thiết bị. Kiểm tra dung lượng hoặc chế độ riêng tư.",
        );
      }
      setState(next);
      current.current = next;
      return next;
    } catch (e) {
      if (userRef.current)
        try {
          const d = await api("state");
          setState(d.state);
          setRevision(d.revision);
        } catch {
          /* Surface the original action error. */
        }
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function login(email: string, password: string) {
    const d = await api("login", { email, password });
    setUser(d.user);
    setState(d.state);
    setRevision(d.revision);
  }
  async function signup(
    name: string,
    email: string,
    password: string,
    businessName: string,
    code: string,
  ) {
    const d = await api("signup", {
      name,
      email,
      password,
      businessName,
      code,
    });
    setUser(d.user);
    setState(d.state);
    setRevision(d.revision);
  }
  async function logout() {
    await api("logout", {});
    setUser(null);
    setState(readDemo());
    setRevision(0);
  }
  function resetDemo() {
    if (user) return;
    const next = initialState();
    localStorage.setItem(KEY, JSON.stringify(next));
    setState(next);
    notify("Đã khôi phục dữ liệu trải nghiệm.");
  }
  return {
    state,
    user,
    busy,
    notice,
    notify,
    dispatch,
    login,
    signup,
    logout,
    resetDemo,
    online,
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
