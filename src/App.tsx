import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  CalendarDays,
  Users,
  UserRoundCog,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  ChevronDown,
  Search,
  Bell,
  Menu,
  PanelLeftClose,
  HelpCircle,
  Store,
  Plus,
  LogOut,
  WifiOff,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { Logo, Button, Modal, Badge } from "./components";
import { getAlerts, type Action } from "./domain";
import {
  Dashboard,
  Orders,
  Inventory,
  Reservations,
  Customers,
  Team,
  Insights,
  SettingsPage,
} from "./views";
import { CustomerPortal, Landing, Auth } from "./public";
const navigation = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Bán hàng & đơn", icon: ShoppingBag },
  { id: "inventory", label: "Kho nguyên liệu", icon: Package },
  { id: "reservations", label: "Bàn & đặt chỗ", icon: CalendarDays },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "team", label: "Nhân sự & ca làm", icon: UserRoundCog },
  { id: "insights", label: "Báo cáo & cảnh báo", icon: ChartNoAxesCombined },
];
export default function App() {
  const w = useWorkspace(),
    [route, setRoute] = useState(location.hash.slice(2) || "dashboard"),
    [venue, setVenue] = useState("all"),
    [query, setQuery] = useState(""),
    [sidebar, setSidebar] = useState(false),
    [alertsOpen, setAlertsOpen] = useState(false),
    [help, setHelp] = useState(false);
  useEffect(() => {
    const f = () => {
      setRoute(location.hash.slice(2) || "dashboard");
      setSidebar(false);
      setQuery("");
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    document.title =
      (navigation.find((n) => n.id === route)?.label || "RESTOCHAIN") +
      " · RESTOCHAIN";
  }, [route]);
  const alerts = getAlerts(w.state, venue);
  async function act(action: Action, success = "Đã lưu thay đổi") {
    try {
      await w.dispatch(action);
      w.notify(success);
      return true;
    } catch (e) {
      w.notify((e as Error).message);
      return false;
    }
  }
  const props = { w, venue, query, act };
  if (route === "intro") return <Landing />;
  if (route === "login") return <Auth w={w} />;
  if (route.startsWith("discover"))
    return <CustomerPortal w={w} slug={route.split("/")[1]} />;
  const current = navigation.find((n) => n.id === route);
  return (
    <div className="app-shell">
      {sidebar && (
        <button
          className="sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={"sidebar " + (sidebar ? "open" : "")}>
        <div className="sidebar-brand">
          <Logo light />
          <button
            className="icon-btn mobile-only"
            aria-label="Đóng menu"
            onClick={() => setSidebar(false)}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-avatar">
            {w.state.businessName.slice(0, 1)}
          </span>
          <div>
            <strong>{w.state.businessName}</strong>
            <small>
              {w.state.venues.length} chi nhánh ·{" "}
              {w.user ? "Không gian doanh nghiệp" : "Không gian trải nghiệm"}
            </small>
          </div>
        </div>
        <p className="nav-caption">KHÔNG GIAN LÀM VIỆC</p>
        <nav aria-label="Điều hướng chính">
          {navigation.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={"#/" + id}
              className={"nav-item " + (route === id ? "active" : "")}
              aria-current={route === id ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "reservations" &&
                w.state.bookings.filter((b) => b.status === "pending").length >
                  0 && (
                  <span className="nav-count">
                    {
                      w.state.bookings.filter((b) => b.status === "pending")
                        .length
                    }
                  </span>
                )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a
            href={"#/discover" + (w.user ? "/" + w.user.slug : "")}
            className="portal-link"
          >
            <Store size={19} />
            <div>
              <strong>Cổng khách hàng</strong>
              <small>Đặt bàn & gọi món trước</small>
            </div>
            <ArrowUpRight size={17} />
          </a>
          <a
            href="#/settings"
            className={"nav-item " + (route === "settings" ? "active" : "")}
          >
            <Settings size={19} />
            Cài đặt
          </a>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <HelpCircle size={19} />
            Hướng dẫn sử dụng
          </button>
          <div className="sidebar-person">
            <span className="avatar">{w.user?.name.slice(0, 1) || "M"}</span>
            <div>
              <strong>{w.user?.name || "Nhóm Mộc"}</strong>
              <small>
                {w.user
                  ? {
                      owner: "Chủ doanh nghiệp",
                      manager: "Quản lý",
                      staff: "Nhân viên",
                    }[w.user.role]
                  : "Đang trải nghiệm"}
              </small>
            </div>
            {w.user ? (
              <button
                className="icon-btn"
                aria-label="Đăng xuất"
                onClick={() => w.logout().catch((e) => w.notify(e.message))}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <a href="#/login" aria-label="Đăng nhập">
                <ArrowUpRight size={19} />
              </a>
            )}
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-only"
              aria-label="Mở menu"
              onClick={() => setSidebar(true)}
            >
              <Menu size={22} />
            </button>
            <span>Không gian quản trị</span>
            <span className="slash">/</span>
            <strong>{current?.label || "Cài đặt"}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-field top-search">
              <Search size={17} />
              <input
                aria-label="Tìm món, đơn, khách hoặc nguyên liệu"
                placeholder="Tìm trong trang…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className="icon-btn bell"
              aria-label={"Thông báo: " + alerts.length + " cảnh báo"}
              onClick={() => setAlertsOpen(true)}
            >
              <Bell size={20} />
              {alerts.length > 0 && <span />}
            </button>
            <a href="#/intro" className="top-brand-link">
              Về RESTOCHAIN
              <ArrowUpRight size={15} />
            </a>
          </div>
        </header>
        <div className={"mode-bar " + (w.user ? "live" : "")}>
          <span>
            {!w.online ? (
              <>
                <WifiOff size={14} /> Đang mất kết nối.{" "}
                {w.user
                  ? "Thao tác cần máy chủ sẽ tạm dừng."
                  : "Dữ liệu trải nghiệm vẫn lưu trên thiết bị."}
              </>
            ) : w.user ? (
              <>
                <CheckCircle2 size={14} /> Đã kết nối không gian doanh nghiệp
              </>
            ) : (
              <>
                <span className="demo-dot" />
                Dữ liệu mẫu · Thao tác chỉ lưu trên trình duyệt này
              </>
            )}
          </span>
          {!w.user && (
            <a href="#/login">
              Kết nối doanh nghiệp <ArrowUpRight size={14} />
            </a>
          )}
        </div>
        <main className="main-content" id="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {route === "dashboard"
                  ? "MỖI CHI NHÁNH. MỘT NHỊP VẬN HÀNH."
                  : "RESTOCHAIN WORKSPACE"}
              </p>
              <h1>
                {route === "dashboard"
                  ? "Toàn cảnh vận hành."
                  : current?.label || "Cài đặt không gian"}
              </h1>
              <p>
                {route === "dashboard"
                  ? "Nắm điều đang diễn ra, để dành thời gian cho điều quan trọng."
                  : route === "orders"
                    ? "Từ một đơn hàng đến nguyên liệu, mọi thay đổi đều có dấu vết."
                    : route === "inventory"
                      ? "Đúng nguyên liệu, đúng số lượng, đúng thời điểm."
                      : route === "reservations"
                        ? "Sắp xếp chỗ ngồi theo thời gian và nhu cầu của khách."
                        : route === "team"
                          ? "Một lịch làm việc rõ ràng cho cả đội ngũ."
                          : route === "customers"
                            ? "Hiểu những người đã chọn quay lại."
                            : route === "insights"
                              ? "Theo dõi số liệu và những việc cần xử lý."
                              : "Thông tin doanh nghiệp và quyền truy cập."}
              </p>
            </div>
            <div className="heading-actions">
              <label className="branch-select">
                <Store size={17} />
                <select
                  aria-label="Chi nhánh"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                >
                  <option value="all">Tất cả chi nhánh</option>
                  {w.state.venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </label>
              {route === "dashboard" && (
                <Button
                  kind="primary"
                  onClick={() => {
                    location.hash = "/orders";
                  }}
                >
                  <Plus size={17} />
                  Tạo đơn hàng
                </Button>
              )}
            </div>
          </div>
          {route === "dashboard" ? (
            <Dashboard {...props} />
          ) : route === "orders" ? (
            <Orders {...props} />
          ) : route === "inventory" ? (
            <Inventory {...props} />
          ) : route === "reservations" ? (
            <Reservations {...props} />
          ) : route === "customers" ? (
            <Customers {...props} />
          ) : route === "team" ? (
            <Team {...props} />
          ) : route === "insights" ? (
            <Insights {...props} />
          ) : route === "settings" ? (
            <SettingsPage {...props} />
          ) : (
            <div className="panel empty">
              <h2>Không tìm thấy trang</h2>
              <a href="#/dashboard">Về tổng quan</a>
            </div>
          )}
          <footer className="app-footer">
            <span>
              RESTOCHAIN <span className="footer-divider">/</span> Kết nối để
              vận hành tốt hơn.
            </span>
            <span>Built with care by 5UP</span>
          </footer>
        </main>
      </div>
      {w.notice && (
        <div role="status" className="toast">
          <CheckCircle2 size={19} />
          {w.notice}
          <button onClick={() => w.notify("")} aria-label="Đóng thông báo">
            ×
          </button>
        </div>
      )}
      {alertsOpen && (
        <Modal title="Việc cần chú ý" onClose={() => setAlertsOpen(false)}>
          <div className="modal-body">
            {alerts.length ? (
              alerts.map((a) => (
                <div className="alert-row" key={a.id}>
                  <TriangleAlert size={20} />
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.detail}</p>
                  </div>
                  <a href="#/inventory" onClick={() => setAlertsOpen(false)}>
                    Xử lý
                  </a>
                </div>
              ))
            ) : (
              <p>Không có nguyên liệu dưới ngưỡng.</p>
            )}
            <p className="muted">
              Cảnh báo được tính theo ngưỡng tồn kho, chưa sử dụng mô hình dự
              báo AI.
            </p>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="Bắt đầu với RESTOCHAIN" onClose={() => setHelp(false)}>
          <div className="modal-body help-steps">
            <p>
              <b>1. Bán hàng:</b> thêm món vào giỏ, tạo đơn rồi xác nhận đã thu
              tiền mặt. Tồn kho được trừ một lần theo công thức.
            </p>
            <p>
              <b>2. Kho:</b> nhập thêm nguyên liệu hoặc ghi xuất mẻ buffet, luôn
              kèm lý do.
            </p>
            <p>
              <b>3. Đặt bàn:</b> mở Cổng khách hàng, chọn bàn và gửi yêu cầu.
              Quay lại Bàn & đặt chỗ để xác nhận.
            </p>
            <p>
              <b>4. Dữ liệu thật:</b> cấu hình cơ sở dữ liệu theo hướng dẫn đi
              kèm mã nguồn, sau đó đăng nhập. Bản trải nghiệm không đồng bộ giữa
              các thiết bị.
            </p>
            <Badge tone="green">Có thể thử ngay bằng dữ liệu mẫu</Badge>
          </div>
        </Modal>
      )}
    </div>
  );
}
