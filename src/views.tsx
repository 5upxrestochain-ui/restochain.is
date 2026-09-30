import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownToLine,
  Plus,
  Minus,
  ShoppingBag,
  Wallet,
  CalendarDays,
  Users,
  TrendingUp,
  Package,
  Search,
  Coffee,
  Leaf,
  Croissant,
  Check,
  Clock,
  TriangleAlert,
  SlidersHorizontal,
  Trash2,
  Mail,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type { Workspace } from "./workspace";
import { api } from "./workspace";
import {
  money,
  dateVN,
  dayOffset,
  displayDate,
  newId,
  getAlerts,
  safeExportCSV,
  type Action,
  type Ingredient,
  type Product,
  type Order,
} from "./domain";
import {
  Badge,
  Button,
  Empty,
  Modal,
  SectionHead,
  Stat,
  Submit,
} from "./components";
export type ViewProps = {
  w: Workspace;
  venue: string;
  query: string;
  act: (a: Action, success?: string) => Promise<boolean>;
};
const match = (s: string, q: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes(
      q
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
    );
const inVenue = (id: string, v: string) => v === "all" || v === id;
const paid = (o: Order) => o.status === "completed";
const orderTone = { preparing: "amber", completed: "green", cancelled: "gray" };
const orderLabel = {
  preparing: "Đang phục vụ",
  completed: "Đã thu tiền",
  cancelled: "Đã hủy",
};
function exportFile(filename: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(
    new Blob([safeExportCSV(rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function safeDay(iso: string) {
  return dateVN(new Date(iso));
}
export function Dashboard({ w, venue, act }: ViewProps) {
  const [period, setPeriod] = useState("7");
  const orders = w.state.orders.filter((o) => inVenue(o.venueId, venue)),
    recent = orders.filter(
      (o) =>
        safeDay(o.settledAt || o.createdAt) >=
          dayOffset(period === "today" ? 0 : -6) &&
        safeDay(o.settledAt || o.createdAt) <= dateVN(),
    );
  const revenue = recent.filter(paid).reduce((n, o) => n + o.total, 0),
    completed = recent.filter(paid).length,
    alerts = getAlerts(w.state, venue),
    bookings = w.state.bookings.filter(
      (b) =>
        b.date === dateVN() &&
        b.status !== "cancelled" &&
        inVenue(b.venueId, venue),
    );
  const days = Array.from({ length: 7 }, (_, i) => dayOffset(i - 6));
  const daily = days.map((d) =>
    orders
      .filter((o) => paid(o) && safeDay(o.settledAt || o.createdAt) === d)
      .reduce((n, o) => n + o.total, 0),
  );
  const max = Math.max(...daily, 100000);
  const points = daily
    .map((v, i) => 45 + i * 94 + "," + (195 - (v / max) * 140))
    .join(" ");
  const products = w.state.products
    .map((p) => ({
      ...p,
      qty: recent
        .filter(paid)
        .flatMap((o) => o.items)
        .filter((i) => i.productId === p.id)
        .reduce((n, i) => n + i.quantity, 0),
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);
  return (
    <>
      <div className="overview-strip">
        <div className="today-label">
          <CalendarDays size={16} />
          {new Intl.DateTimeFormat("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date())}
        </div>
        <div className="segmented">
          <button
            className={period === "today" ? "selected" : ""}
            onClick={() => setPeriod("today")}
          >
            Hôm nay
          </button>
          <button
            className={period === "7" ? "selected" : ""}
            onClick={() => setPeriod("7")}
          >
            7 ngày qua
          </button>
        </div>
      </div>
      <div className="stats-grid">
        <Stat
          label="Doanh thu đã thu"
          value={money(revenue)}
          note={period === "today" ? "Trong hôm nay" : "Trong 7 ngày gần nhất"}
          icon={<Wallet size={20} />}
          tone="featured"
        />
        <Stat
          label="Đơn hàng hoàn tất"
          value={String(completed)}
          note={
            recent.filter((o) => o.status === "preparing").length +
            " đơn đang phục vụ"
          }
          icon={<ShoppingBag size={20} />}
        />
        <Stat
          label="Giá trị đơn trung bình"
          value={money(completed ? revenue / completed : 0)}
          note="Tính trên các đơn đã thu tiền"
          icon={<TrendingUp size={20} />}
        />
        <Stat
          label="Đặt bàn hôm nay"
          value={String(bookings.length).padStart(2, "0")}
          note={
            bookings.filter((b) => b.status === "pending").length +
            " yêu cầu chờ xác nhận"
          }
          icon={<CalendarDays size={20} />}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel revenue-panel">
          <SectionHead
            title="Nhịp kinh doanh"
            subtitle="Doanh thu đã thu trong 7 ngày gần nhất"
            action={
              <Badge tone="green">
                <span className="legend-dot" />
                Doanh thu
              </Badge>
            }
          />
          <div className="chart-head">
            <strong>{money(daily.reduce((a, b) => a + b, 0))}</strong>
            <span>
              {
                orders.filter(
                  (o) =>
                    paid(o) &&
                    safeDay(o.settledAt || o.createdAt) >= dayOffset(-6),
                ).length
              }{" "}
              đơn hoàn tất
            </span>
          </div>
          <div className="chart-wrap">
            <svg
              viewBox="0 0 670 250"
              role="img"
              aria-label={
                "Biểu đồ doanh thu bảy ngày: " +
                daily
                  .map((v, i) => displayDate(days[i]) + ": " + money(v))
                  .join("; ")
              }
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#32846c" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#32846c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[55, 101, 148, 195].map((y, i) => (
                <g key={y}>
                  <line
                    x1="45"
                    x2="630"
                    y1={y}
                    y2={y}
                    stroke="#e7ece8"
                    strokeDasharray="4 5"
                  />
                  <text x="0" y={y + 4} fill="#7e8b86" fontSize="11">
                    {((max * (3 - i)) / 3 / 1000000).toFixed(1)}tr
                  </text>
                </g>
              ))}
              <polygon
                points={"45,195 " + points + " 609,195"}
                fill="url(#chart-fill)"
              />
              <polyline
                points={points}
                fill="none"
                stroke="#26785f"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {daily.map((v, i) => (
                <g key={i}>
                  <circle
                    cx={45 + i * 94}
                    cy={195 - (v / max) * 140}
                    r="4"
                    fill="#fff"
                    stroke="#26785f"
                    strokeWidth="2"
                  />
                  <text
                    x={45 + i * 94}
                    y="229"
                    textAnchor="middle"
                    fill="#7e8b86"
                    fontSize="12"
                  >
                    {displayDate(days[i])}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="chart-foot">
            <span>
              <span className="legend-dot" />
              Đã xác nhận thu tiền mặt
            </span>
            <a href="#/insights">
              Xem báo cáo <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
        <section className="panel attention-panel">
          <SectionHead
            title="Cần bạn chú ý"
            action={<Badge tone="amber">{alerts.length}</Badge>}
          />
          <p className="muted attention-sub">
            Những việc nhỏ giúp ca làm trôi chảy.
          </p>
          {alerts.slice(0, 3).map((a) => (
            <div className="attention-item" key={a.id}>
              <span className="attention-icon">
                <Package size={18} />
              </span>
              <div>
                <strong>{a.title}</strong>
                <p>{a.detail}</p>
                <span>
                  {w.state.venues.find((v) => v.id === a.venueId)?.name}
                </span>
              </div>
            </div>
          ))}
          {!alerts.length && (
            <Empty
              title="Mọi thứ đang ổn"
              text="Tồn kho của các nguyên liệu đều trên ngưỡng."
            />
          )}
          <a className="attention-link" href="#/inventory">
            Kiểm tra nguyên liệu <ArrowRight size={16} />
          </a>
        </section>
        <section className="panel">
          <SectionHead
            title="Đặt bàn hôm nay"
            action={
              <a className="text-link" href="#/reservations">
                Tất cả <ArrowUpRight size={15} />
              </a>
            }
          />
          {bookings.length ? (
            <div className="booking-preview">
              {bookings.slice(0, 4).map((b) => (
                <div className="booking-mini" key={b.id}>
                  <span className="booking-time">{b.time}</span>
                  <div>
                    <strong>{b.name}</strong>
                    <p>
                      {b.guests} khách ·{" "}
                      {w.state.tables.find((t) => t.id === b.tableId)?.name} ·{" "}
                      {b.need}
                    </p>
                  </div>
                  {b.status === "pending" ? (
                    <Button
                      onClick={() =>
                        act(
                          {
                            type: "BOOKING_STATUS",
                            payload: { id: b.id, status: "confirmed" },
                          },
                          "Đã xác nhận bàn.",
                        )
                      }
                    >
                      Xác nhận
                    </Button>
                  ) : (
                    <Badge tone="green">
                      {b.status === "arrived" ? "Đã đến" : "Đã xác nhận"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="Chưa có lịch đặt hôm nay"
              text="Yêu cầu từ cổng khách hàng sẽ xuất hiện tại đây."
            />
          )}
        </section>
        <section className="panel">
          <SectionHead
            title="Món được yêu thích"
            subtitle={
              period === "today"
                ? "Theo đơn đã thu hôm nay"
                : "Theo đơn đã thu trong 7 ngày"
            }
          />
          <div className="top-products">
            {products.map((p, i) => (
              <div className="top-product" key={p.id}>
                <span className="rank">0{i + 1}</span>
                <span
                  className="product-mini-icon"
                  style={{ background: p.color }}
                >
                  {p.category === "Bánh ngọt" ? (
                    <Croissant size={20} />
                  ) : p.category === "Cà phê" ? (
                    <Coffee size={20} />
                  ) : (
                    <Leaf size={20} />
                  )}
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
                <b>
                  {p.qty}
                  <small>đã bán</small>
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel branch-panel">
        <SectionHead
          title="Hiệu quả từng chi nhánh"
          subtitle={
            period === "today" ? "Tổng hợp hôm nay" : "Tổng hợp 7 ngày gần nhất"
          }
          action={
            <Badge>
              {w.state.venues.filter((v) => inVenue(v.id, venue)).length} chi
              nhánh
            </Badge>
          }
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Chi nhánh</th>
                <th>Mô hình</th>
                <th>Đơn hoàn tất</th>
                <th>Doanh thu đã thu</th>
                <th>Việc cần chú ý</th>
              </tr>
            </thead>
            <tbody>
              {w.state.venues
                .filter((v) => inVenue(v.id, venue))
                .map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div className="cell-title">
                        <span className="branch-icon">
                          <MapPin size={18} />
                        </span>
                        <div>
                          <strong>{v.name}</strong>
                          <small>{v.area}</small>
                        </div>
                      </div>
                    </td>
                    <td>{v.model === "cafe" ? "Cà phê" : "Buffet"}</td>
                    <td>
                      {
                        recent.filter((o) => paid(o) && o.venueId === v.id)
                          .length
                      }
                    </td>
                    <td className="number">
                      {money(
                        recent
                          .filter((o) => paid(o) && o.venueId === v.id)
                          .reduce((n, o) => n + o.total, 0),
                      )}
                    </td>
                    <td>
                      <Badge
                        tone={
                          getAlerts(w.state, v.id).length ? "amber" : "green"
                        }
                      >
                        {getAlerts(w.state, v.id).length
                          ? getAlerts(w.state, v.id).length + " cảnh báo"
                          : "Ổn định"}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
export function Orders({ w, venue, query, act }: ViewProps) {
  const [tab, setTab] = useState("pos"),
    [category, setCategory] = useState("Tất cả"),
    [cart, setCart] = useState<Record<string, number>>({}),
    [table, setTable] = useState("Mang đi"),
    [posVenue, setPosVenue] = useState(
      w.state.venues.find((v) => v.model === "cafe")?.id || "v1",
    ),
    [detail, setDetail] = useState<Order | null>(null),
    [filter, setFilter] = useState("all"),
    [cancel, setCancel] = useState<Order | null>(null),
    [settle, setSettle] = useState<Order | null>(null),
    [error, setError] = useState("");
  const s = w.state,
    items = s.products.filter((p) => cart[p.id]),
    total = items.reduce((n, p) => n + p.price * cart[p.id], 0),
    cafeVenues = s.venues.filter((v) => v.model === "cafe");
  const orders = s.orders
    .filter(
      (o) =>
        inVenue(o.venueId, venue) &&
        (filter === "all" || o.status === filter) &&
        match(o.code + " " + o.customer + " " + o.table, query),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  async function create() {
    setError("");
    if (!items.length) {
      setError("Chọn ít nhất một món trước khi tạo đơn.");
      return;
    }
    if (
      await act(
        {
          type: "ORDER_CREATE",
          payload: {
            id: newId(),
            venueId: posVenue,
            table,
            items: items.map((p) => ({
              productId: p.id,
              quantity: cart[p.id],
            })),
          },
        },
        "Đã tạo đơn. Xác nhận thu tiền tại Danh sách đơn.",
      )
    ) {
      setCart({});
      setTab("list");
    }
  }
  return (
    <>
      <div className="view-toolbar">
        <div className="segmented large">
          <button
            className={tab === "pos" ? "selected" : ""}
            onClick={() => setTab("pos")}
          >
            <Plus size={16} />
            Tạo đơn
          </button>
          <button
            className={tab === "list" ? "selected" : ""}
            onClick={() => setTab("list")}
          >
            Danh sách đơn <span>{orders.length}</span>
          </button>
          <button
            className={tab === "menu" ? "selected" : ""}
            onClick={() => setTab("menu")}
          >
            Danh mục món
          </button>
        </div>
        {tab === "list" && (
          <Button
            onClick={() =>
              exportFile("RESTOCHAIN-don-hang.csv", [
                ["Mã đơn", "Thời gian", "Khách", "Trạng thái", "Tổng tiền"],
                ...orders.map((o) => [
                  o.code,
                  o.createdAt,
                  o.customer,
                  orderLabel[o.status],
                  o.total,
                ]),
              ])
            }
          >
            <ArrowDownToLine size={16} />
            Xuất CSV
          </Button>
        )}
      </div>
      {tab === "pos" ? (
        <div className="pos-layout">
          <section>
            <div className="category-tabs">
              {["Tất cả", "Cà phê", "Trà & Matcha", "Bánh ngọt"].map((c) => (
                <button
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="products-grid">
              {s.products
                .filter(
                  (p) =>
                    (category === "Tất cả" || p.category === category) &&
                    match(p.name, query),
                )
                .map((p) => (
                  <button
                    className="product-card"
                    key={p.id}
                    onClick={() =>
                      setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 })
                    }
                  >
                    <span
                      className="product-art"
                      style={{ background: p.color }}
                    >
                      {p.category === "Cà phê" ? (
                        <Coffee size={43} strokeWidth={1.3} />
                      ) : p.category === "Bánh ngọt" ? (
                        <Croissant size={43} strokeWidth={1.3} />
                      ) : (
                        <Leaf size={43} strokeWidth={1.3} />
                      )}
                      <span className="add-circle">
                        <Plus size={19} />
                      </span>
                    </span>
                    <span className="product-category">{p.category}</span>
                    <strong>{p.name}</strong>
                    <span className="product-price">{money(p.price)}</span>
                  </button>
                ))}
            </div>
          </section>
          <aside className="panel cart-panel">
            <SectionHead
              title="Đơn hàng mới"
              action={
                <Badge>
                  {Object.values(cart).reduce((a, b) => a + b, 0)} món
                </Badge>
              }
            />
            <div className="cart-selects">
              <label>
                Chi nhánh
                <select
                  value={posVenue}
                  onChange={(e) => setPosVenue(e.target.value)}
                >
                  {cafeVenues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Phục vụ tại
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                >
                  <option>Mang đi</option>
                  {s.tables
                    .filter((t) => t.venueId === posVenue)
                    .map((t) => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                </select>
              </label>
            </div>
            <div className="cart-items">
              {items.length ? (
                items.map((p) => (
                  <div className="cart-item" key={p.id}>
                    <div>
                      <strong>{p.name}</strong>
                      <small>{money(p.price)}</small>
                    </div>
                    <div className="qty-control">
                      <button
                        aria-label={"Giảm " + p.name}
                        onClick={() =>
                          setCart({
                            ...cart,
                            [p.id]: Math.max(0, cart[p.id] - 1),
                          })
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <span>{cart[p.id]}</span>
                      <button
                        aria-label={"Tăng " + p.name}
                        onClick={() =>
                          setCart({
                            ...cart,
                            [p.id]: Math.min(100, cart[p.id] + 1),
                          })
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  title="Giỏ hàng đang trống"
                  text="Chọn món ở bên trái để bắt đầu."
                />
              )}
            </div>
            <div className="cart-total">
              <span>Tổng tiền</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="muted small">
              Giá niêm yết. Đơn chưa được đánh dấu đã thanh toán khi tạo.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button
              kind="primary"
              disabled={w.busy || !items.length}
              onClick={create}
            >
              <ShoppingBag size={17} />
              Ghi nhận đơn hàng
            </Button>
          </aside>
        </div>
      ) : tab === "list" ? (
        <section className="panel">
          <div className="table-toolbar">
            <div className="filter-tabs">
              {[
                ["all", "Tất cả"],
                ["preparing", "Đang phục vụ"],
                ["completed", "Đã thu tiền"],
                ["cancelled", "Đã hủy"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={filter === id ? "active" : ""}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn / thời gian</th>
                  <th>Bàn / chi nhánh</th>
                  <th>Số món</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 100).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <button
                        className="table-link"
                        onClick={() => setDetail(o)}
                      >
                        {o.code}
                      </button>
                      <small>
                        {new Date(o.createdAt).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </td>
                    <td>
                      {o.table}
                      <small>
                        {s.venues.find((v) => v.id === o.venueId)?.name}
                      </small>
                    </td>
                    <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="number">{money(o.total)}</td>
                    <td>
                      <Badge tone={orderTone[o.status]}>
                        {orderLabel[o.status]}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {o.status === "preparing" ? (
                          <>
                            <button
                              className="mini-btn green"
                              onClick={() => setSettle(o)}
                            >
                              Thu tiền
                            </button>
                            <button
                              className="icon-btn"
                              aria-label={"Hủy " + o.code}
                              onClick={() => setCancel(o)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="mini-btn"
                            onClick={() => setDetail(o)}
                          >
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <Empty title="Chưa có đơn phù hợp" />}
          </div>
          {orders.length > 100 && (
            <p className="table-note">
              Hiển thị 100 đơn gần nhất. Xuất CSV để xem toàn bộ.
            </p>
          )}
        </section>
      ) : (
        <MenuEditor {...{ w, venue, query, act }} />
      )}
      {detail && (
        <Modal
          title={"Chi tiết " + detail.code}
          onClose={() => setDetail(null)}
        >
          <div className="modal-body">
            <Badge tone={orderTone[detail.status]}>
              {orderLabel[detail.status]}
            </Badge>
            {detail.items.map((i, k) => (
              <div key={k} className="receipt-row">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <b>{money(i.price * i.quantity)}</b>
              </div>
            ))}
            <div className="cart-total">
              <span>Tổng cộng</span>
              <strong>{money(detail.total)}</strong>
            </div>
            <p className="muted">
              {detail.payment === "cash"
                ? "Nhân viên đã xác nhận thu tiền mặt."
                : "Chưa thu tiền."}
            </p>
          </div>
        </Modal>
      )}
      {settle && (
        <Modal title="Xác nhận đã thu tiền mặt" onClose={() => setSettle(null)}>
          <div className="modal-body">
            <p>
              Bạn đã nhận đủ <b>{money(settle.total)}</b> cho đơn{" "}
              <b>{settle.code}</b>?
            </p>
            <p className="muted">
              Thao tác sẽ ghi nhận doanh thu và trừ nguyên liệu theo công thức
              một lần.
            </p>
            <div className="form-actions">
              <Button onClick={() => setSettle(null)}>Chưa nhận tiền</Button>
              <Button
                kind="primary"
                disabled={w.busy}
                onClick={async () => {
                  if (
                    await act(
                      { type: "ORDER_SETTLE", payload: { id: settle.id } },
                      "Đã ghi nhận thu tiền và cập nhật tồn kho.",
                    )
                  )
                    setSettle(null);
                }}
              >
                Đã nhận đủ tiền
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {cancel && (
        <Modal title={"Hủy đơn " + cancel.code} onClose={() => setCancel(null)}>
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await act(
                  {
                    type: "ORDER_CANCEL",
                    payload: { id: cancel.id, reason: String(f.get("reason")) },
                  },
                  "Đã hủy đơn và lưu lý do.",
                )
              )
                setCancel(null);
            }}
          >
            <label>
              Lý do hủy
              <input
                name="reason"
                required
                maxLength={160}
                placeholder="Ví dụ: khách thay đổi nhu cầu"
              />
            </label>
            <div className="form-actions">
              <Button onClick={() => setCancel(null)}>Quay lại</Button>
              <Submit busy={w.busy} label="Xác nhận hủy" />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
function MenuEditor({ w, query, act }: ViewProps) {
  const [edit, setEdit] = useState<Product | null>(null);
  const ingredients = w.state.ingredients.filter(
    (i, index, all) =>
      all.findIndex((x) => x.id === i.id) === index &&
      w.state.venues.find((v) => v.id === i.venueId)?.model === "cafe",
  );
  return (
    <>
      <section className="panel">
        <SectionHead
          title="Thực đơn & công thức"
          subtitle="Mỗi đơn mới lưu giá và công thức tại lúc tạo; thay đổi không làm sửa ngược đơn đã có."
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Món</th>
                <th>Nhóm</th>
                <th>Giá niêm yết</th>
                <th>Công thức / khẩu phần</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {w.state.products
                .filter((p) => match(p.name, query))
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.name}</b>
                    </td>
                    <td>{p.category}</td>
                    <td>{money(p.price)}</td>
                    <td>
                      {p.bom.map((b) => {
                        const i = w.state.ingredients.find(
                          (i) => i.id === b.ingredientId,
                        );
                        return (
                          <small key={b.ingredientId}>
                            {i?.name}: {b.quantity} {i?.unit}
                          </small>
                        );
                      })}
                    </td>
                    <td>
                      <Button
                        disabled={w.user?.role === "staff"}
                        onClick={() => setEdit(p)}
                      >
                        Chỉnh sửa
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {edit && (
        <Modal title="Chỉnh sửa món" onClose={() => setEdit(null)}>
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await act(
                  {
                    type: "PRODUCT_SAVE",
                    payload: {
                      id: edit.id,
                      name: f.get("name"),
                      price: Number(f.get("price")),
                      bom: ingredients
                        .map((i) => ({
                          ingredientId: i.id,
                          quantity: Number(f.get("bom-" + i.id)),
                        }))
                        .filter((b) => b.quantity > 0),
                    },
                  },
                  "Đã cập nhật thực đơn.",
                )
              )
                setEdit(null);
            }}
          >
            <label>
              Tên món
              <input
                name="name"
                required
                defaultValue={edit.name}
                maxLength={80}
              />
            </label>
            <label>
              Giá bán (đồng)
              <input
                name="price"
                type="number"
                required
                min="1000"
                max="10000000"
                step="1000"
                defaultValue={edit.price}
              />
            </label>
            <fieldset className="recipe-fields">
              <legend>Nguyên liệu cho một phần</legend>
              <p className="muted small">
                Điền đúng đơn vị bên cạnh. Để 0 nếu món không dùng nguyên liệu
                đó.
              </p>
              <div className="form-grid">
                {ingredients.map((i) => (
                  <label key={i.id}>
                    {i.name} ({i.unit})
                    <input
                      type="number"
                      name={"bom-" + i.id}
                      min="0"
                      max="100"
                      step="0.0001"
                      defaultValue={
                        edit.bom.find((b) => b.ingredientId === i.id)
                          ?.quantity || 0
                      }
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <Submit busy={w.busy} />
          </form>
        </Modal>
      )}
    </>
  );
}

export function Inventory({ w, venue, query, act }: ViewProps) {
  const [onlyLow, setOnlyLow] = useState(false),
    [edit, setEdit] = useState<Ingredient | null>(null),
    [direction, setDirection] = useState("in");
  const items = w.state.ingredients.filter(
      (i) =>
        inVenue(i.venueId, venue) &&
        match(i.name, query) &&
        (!onlyLow || i.stock < i.min),
    ),
    all = w.state.ingredients.filter((i) => inVenue(i.venueId, venue));
  return (
    <>
      <div className="stats-grid three">
        <Stat
          label="Danh mục nguyên liệu"
          value={String(all.length)}
          note="Theo chi nhánh đang chọn"
          icon={<Package size={20} />}
        />
        <Stat
          label="Giá trị tồn kho tham khảo"
          value={money(all.reduce((n, i) => n + i.stock * i.cost, 0))}
          note="Tồn thực tế × đơn giá tham khảo"
          icon={<Wallet size={20} />}
        />
        <Stat
          label="Cần bổ sung"
          value={String(all.filter((i) => i.stock < i.min).length)}
          note="Nguyên liệu dưới ngưỡng tối thiểu"
          icon={<TriangleAlert size={20} />}
        />
      </div>
      <section className="panel">
        <SectionHead
          title="Tồn kho nguyên liệu"
          subtitle="Café: xuất theo công thức khi thu tiền. Buffet: ghi nhận xuất mẻ có lý do."
          action={
            <Button
              onClick={() =>
                exportFile("RESTOCHAIN-ton-kho.csv", [
                  ["Nguyên liệu", "Chi nhánh", "Tồn", "Đơn vị", "Ngưỡng"],
                  ...items.map((i) => [
                    i.name,
                    w.state.venues.find((v) => v.id === i.venueId)?.name || "",
                    i.stock,
                    i.unit,
                    i.min,
                  ]),
                ])
              }
            >
              <ArrowDownToLine size={16} />
              Xuất CSV
            </Button>
          }
        />
        <div className="table-toolbar">
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
            />
            Chỉ hiện nguyên liệu cần bổ sung
          </label>
          <Badge>{items.length} nguyên liệu</Badge>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nguyên liệu</th>
                <th>Chi nhánh</th>
                <th>Tồn hiện tại</th>
                <th>Ngưỡng tối thiểu</th>
                <th>Tình trạng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.venueId + i.id}>
                  <td>
                    <b>{i.name}</b>
                    <small>{i.id.toUpperCase()}</small>
                  </td>
                  <td>
                    {w.state.venues.find((v) => v.id === i.venueId)?.name}
                  </td>
                  <td className="number">
                    {i.stock.toLocaleString("vi-VN")}{" "}
                    <span className="muted">{i.unit}</span>
                  </td>
                  <td>
                    {i.min} {i.unit}
                  </td>
                  <td>
                    <Badge tone={i.stock < i.min ? "amber" : "green"}>
                      {i.stock < i.min ? "Cần bổ sung" : "Đủ tồn kho"}
                    </Badge>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="mini-btn"
                        disabled={w.user?.role === "staff"}
                        onClick={() => {
                          setDirection("in");
                          setEdit(i);
                        }}
                      >
                        Nhập kho
                      </button>
                      <button
                        className="mini-btn"
                        disabled={w.user?.role === "staff"}
                        onClick={() => {
                          setDirection("out");
                          setEdit(i);
                        }}
                      >
                        Xuất kho
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <Empty title="Không có nguyên liệu phù hợp" />}
        </div>
      </section>
      {edit && (
        <Modal
          title={
            (direction === "in" ? "Nhập kho · " : "Xuất kho · ") + edit.name
          }
          onClose={() => setEdit(null)}
        >
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await act(
                  {
                    type: "STOCK_ADJUST",
                    payload: {
                      id: edit.id,
                      venueId: edit.venueId,
                      direction,
                      quantity: Number(f.get("quantity")),
                      reason: f.get("reason"),
                    },
                  },
                  "Đã cập nhật tồn kho và lưu nhật ký.",
                )
              )
                setEdit(null);
            }}
          >
            <p className="muted">
              Tồn hiện tại: {edit.stock} {edit.unit}
            </p>
            <label>
              Số lượng ({edit.unit})
              <input
                autoFocus
                type="number"
                name="quantity"
                min="0.0001"
                step="any"
                max={direction === "out" ? edit.stock : 100000}
                required
              />
            </label>
            <label>
              Lý do / chứng từ
              <input
                name="reason"
                required
                maxLength={160}
                placeholder={
                  direction === "in"
                    ? "Nhập theo phiếu giao hàng…"
                    : "Xuất mẻ buffet / hư hỏng / kiểm kê…"
                }
              />
            </label>
            <Submit busy={w.busy} />
          </form>
        </Modal>
      )}
    </>
  );
}
export function Reservations({ w, venue, query, act }: ViewProps) {
  const [date, setDate] = useState(dateVN()),
    [view, setView] = useState("list");
  const bookings = w.state.bookings
    .filter(
      (b) =>
        inVenue(b.venueId, venue) &&
        b.date === date &&
        match(b.name + " " + b.phone, query),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <>
      <div className="view-toolbar">
        <div className="segmented large">
          <button
            className={view === "list" ? "selected" : ""}
            onClick={() => setView("list")}
          >
            Danh sách đặt bàn
          </button>
          <button
            className={view === "map" ? "selected" : ""}
            onClick={() => setView("map")}
          >
            Sơ đồ bàn
          </button>
        </div>
        <div className="row-actions">
          <input
            aria-label="Ngày đặt bàn"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <a
            className="btn primary"
            href={"#/discover" + (w.user ? "/" + w.user.slug : "")}
          >
            <Plus size={17} />
            Đặt bàn mới
          </a>
        </div>
      </div>
      {view === "list" ? (
        <section className="panel">
          <SectionHead
            title={"Lịch đặt · " + displayDate(date)}
            subtitle="Yêu cầu mới chờ nhân viên xác nhận. Giữ chỗ tạm thời trong 30 phút."
            action={<Badge>{bookings.length} lượt đặt</Badge>}
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Thời gian</th>
                  <th>Bàn / Số khách</th>
                  <th>Nhu cầu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b>{b.name}</b>
                      <small>{b.phone}</small>
                    </td>
                    <td>
                      {b.time}
                      <small>{b.duration} phút</small>
                    </td>
                    <td>
                      {w.state.tables.find((t) => t.id === b.tableId)?.name} ·{" "}
                      {b.guests} khách
                      <small>
                        {w.state.venues.find((v) => v.id === b.venueId)?.name}
                      </small>
                    </td>
                    <td>
                      {b.need}
                      <small>{b.note}</small>
                      {b.items.length > 0 && (
                        <small>
                          Đặt trước:{" "}
                          {b.items
                            .map(
                              (i) =>
                                i.quantity +
                                " × " +
                                (i.name ||
                                  w.state.products.find(
                                    (p) => p.id === i.productId,
                                  )?.name),
                            )
                            .join(", ")}{" "}
                          · {money(b.total)}{" "}
                          {b.orderId ? "(đã chuyển sang đơn)" : "(chưa thu)"}
                        </small>
                      )}
                    </td>
                    <td>
                      <Badge
                        tone={
                          b.status === "cancelled"
                            ? "gray"
                            : b.status === "pending"
                              ? "amber"
                              : "green"
                        }
                      >
                        {
                          {
                            pending: "Chờ xác nhận",
                            confirmed: "Đã xác nhận",
                            arrived: "Đã đến",
                            cancelled: "Đã hủy",
                          }[b.status]
                        }
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {b.status === "arrived" &&
                          b.items.length > 0 &&
                          !b.orderId && (
                            <button
                              className="mini-btn green"
                              disabled={w.busy}
                              onClick={() =>
                                act(
                                  {
                                    type: "BOOKING_TO_ORDER",
                                    payload: { id: b.id },
                                  },
                                  "Đã chuyển món sang đơn chờ thu tiền. Mở Bán hàng & đơn → Danh sách đơn để xử lý.",
                                )
                              }
                            >
                              Chuyển món sang đơn
                            </button>
                          )}
                        {b.orderId && (
                          <a className="mini-btn" href="#/orders">
                            Xem đơn{" "}
                            {
                              w.state.orders.find((o) => o.id === b.orderId)
                                ?.code
                            }
                          </a>
                        )}
                        {b.status === "pending" && (
                          <button
                            className="mini-btn green"
                            disabled={w.busy}
                            onClick={() =>
                              act(
                                {
                                  type: "BOOKING_STATUS",
                                  payload: { id: b.id, status: "confirmed" },
                                },
                                "Đã xác nhận bàn.",
                              )
                            }
                          >
                            Xác nhận
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            className="mini-btn green"
                            disabled={w.busy}
                            onClick={() =>
                              act(
                                {
                                  type: "BOOKING_STATUS",
                                  payload: { id: b.id, status: "arrived" },
                                },
                                "Đã ghi nhận khách đến.",
                              )
                            }
                          >
                            Khách đến
                          </button>
                        )}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button
                            className="mini-btn"
                            disabled={w.busy}
                            onClick={() =>
                              act(
                                {
                                  type: "BOOKING_STATUS",
                                  payload: { id: b.id, status: "cancelled" },
                                },
                                "Đã hủy yêu cầu.",
                              )
                            }
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bookings.length && (
              <Empty
                title="Chưa có lịch đặt cho ngày này"
                text="Chọn ngày khác hoặc tạo lượt đặt mới."
              />
            )}
          </div>
        </section>
      ) : (
        <section className="panel">
          <SectionHead
            title="Không gian phục vụ"
            subtitle="Số lượt đặt được tính trong cả ngày; chọn thời gian cụ thể ở cổng khách hàng để kiểm tra chỗ trống."
          />
          {w.state.venues
            .filter((v) => inVenue(v.id, venue))
            .map((v) => (
              <div className="floor-section" key={v.id}>
                <h3>{v.name}</h3>
                <div className="floor-grid">
                  {w.state.tables
                    .filter((t) => t.venueId === v.id)
                    .map((t) => {
                      const count = bookings.filter(
                        (b) => b.tableId === t.id && b.status !== "cancelled",
                      ).length;
                      return (
                        <article
                          className={
                            "floor-table " + (count ? "has-booking" : "")
                          }
                          key={t.id}
                        >
                          <span className="floor-seat" />
                          <strong>{t.name}</strong>
                          <span>
                            {t.seats} chỗ · {t.zone}
                          </span>
                          <small>
                            {count ? count + " lượt đặt" : "Chưa có lịch"}
                          </small>
                          <span className="floor-seat bottom" />
                        </article>
                      );
                    })}
                </div>
              </div>
            ))}
        </section>
      )}
    </>
  );
}
export function Customers({ w, query, act }: ViewProps) {
  const [add, setAdd] = useState(false);
  const items = w.state.customers.filter((c) =>
    match(c.name + " " + c.phone, query),
  );
  return (
    <>
      <div className="stats-grid three">
        <Stat
          label="Khách hàng đã lưu"
          value={String(w.state.customers.length)}
          note="Hồ sơ do doanh nghiệp quản lý"
          icon={<Users size={20} />}
        />
        <Stat
          label="Khách quay lại"
          value={String(w.state.customers.filter((c) => c.visits > 1).length)}
          note="Có trên một lượt giao dịch ghi nhận"
          icon={<RefreshCw size={20} />}
        />
        <Stat
          label="Đồng ý nhận ưu đãi"
          value={String(
            w.state.customers.filter((c) => c.marketingConsent).length,
          )}
          note="Chỉ liên hệ theo lựa chọn của khách"
          icon={<Mail size={20} />}
        />
      </div>
      <section className="panel">
        <SectionHead
          title="Danh sách khách hàng"
          subtitle="Lịch sử trong bản trải nghiệm là số liệu minh họa. Hồ sơ mới bắt đầu từ 0 lượt."
          action={
            <Button
              kind="primary"
              disabled={w.user?.role === "staff"}
              onClick={() => setAdd(true)}
            >
              <Plus size={17} />
              Thêm khách hàng
            </Button>
          }
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Lượt ghé</th>
                <th>Tổng chi tiêu ghi nhận</th>
                <th>Nhận ưu đãi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-title">
                      <span className="avatar pastel">
                        {c.name.split(" ").at(-1)?.slice(0, 1)}
                      </span>
                      <b>{c.name}</b>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.visits}</td>
                  <td className="number">{money(c.spend)}</td>
                  <td>
                    <Badge tone={c.marketingConsent ? "green" : "gray"}>
                      {c.marketingConsent ? "Đã đồng ý" : "Chưa đăng ký"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <Empty title="Chưa có khách hàng phù hợp" />}
        </div>
      </section>
      {add && (
        <Modal title="Thêm khách hàng" onClose={() => setAdd(false)}>
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await act(
                  {
                    type: "CUSTOMER_ADD",
                    payload: {
                      id: newId(),
                      name: f.get("name"),
                      phone: f.get("phone"),
                      marketingConsent: f.get("consent") === "on",
                    },
                  },
                  "Đã thêm hồ sơ khách hàng.",
                )
              )
                setAdd(false);
            }}
          >
            <label>
              Họ và tên
              <input name="name" required maxLength={80} />
            </label>
            <label>
              Số điện thoại
              <input
                name="phone"
                type="tel"
                required
                placeholder="09xxxxxxxx"
              />
            </label>
            <label className="check-label">
              <input type="checkbox" name="consent" />
              Khách đã đồng ý nhận thông tin ưu đãi
            </label>
            <Submit busy={w.busy} />
          </form>
        </Modal>
      )}
    </>
  );
}
export function Team({ w, venue, query, act }: ViewProps) {
  const [add, setAdd] = useState(false),
    [date, setDate] = useState(dateVN());
  const items = w.state.shifts.filter(
    (s) => inVenue(s.venueId, venue) && s.date === date && match(s.name, query),
  );
  return (
    <>
      <div className="view-toolbar">
        <div className="date-label">
          <CalendarDays size={18} />
          <input
            type="date"
            aria-label="Ngày làm việc"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button
          kind="primary"
          disabled={w.user?.role === "staff"}
          onClick={() => setAdd(true)}
        >
          <Plus size={17} />
          Xếp ca mới
        </Button>
      </div>
      <section className="panel">
        <SectionHead
          title="Lịch làm việc"
          subtitle="Chấm công thủ công có lưu nhật ký; chưa sử dụng GPS hoặc nhận diện khuôn mặt."
          action={<Badge>{items.length} ca</Badge>}
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Chi nhánh</th>
                <th>Ca làm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-title">
                      <span className="avatar pastel">
                        {s.name.slice(0, 1)}
                      </span>
                      <div>
                        <b>{s.name}</b>
                        <small>{s.role}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {w.state.venues.find((v) => v.id === s.venueId)?.name}
                  </td>
                  <td>
                    {s.start}–{s.end}
                  </td>
                  <td>
                    <Badge
                      tone={
                        s.status === "scheduled"
                          ? "gray"
                          : s.status === "checked-in"
                            ? "green"
                            : "blue"
                      }
                    >
                      {
                        {
                          scheduled: "Đã xếp ca",
                          "checked-in": "Đang làm",
                          completed: "Đã kết thúc",
                        }[s.status]
                      }
                    </Badge>
                  </td>
                  <td>
                    {s.status !== "completed" && (
                      <button
                        className="mini-btn"
                        disabled={w.busy}
                        onClick={() =>
                          act(
                            {
                              type: "SHIFT_STATUS",
                              payload: {
                                id: s.id,
                                status:
                                  s.status === "scheduled"
                                    ? "checked-in"
                                    : "completed",
                              },
                            },
                            "Đã cập nhật ca làm.",
                          )
                        }
                      >
                        {s.status === "scheduled" ? "Vào ca" : "Kết thúc ca"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && (
            <Empty
              title="Chưa có ca làm việc"
              text="Xếp ca mới hoặc chọn một ngày khác."
            />
          )}
        </div>
      </section>
      {add && (
        <Modal title="Xếp ca làm việc" onClose={() => setAdd(false)}>
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await act(
                  {
                    type: "SHIFT_ADD",
                    payload: {
                      id: newId(),
                      name: f.get("name"),
                      role: f.get("role"),
                      venueId: f.get("venueId"),
                      date: f.get("date"),
                      start: f.get("start"),
                      end: f.get("end"),
                    },
                  },
                  "Đã xếp ca làm việc.",
                )
              )
                setAdd(false);
            }}
          >
            <label>
              Tên nhân viên
              <input name="name" required maxLength={80} />
            </label>
            <div className="form-grid">
              <label>
                Vị trí
                <select name="role">
                  <option>Thu ngân</option>
                  <option>Pha chế</option>
                  <option>Phục vụ</option>
                  <option>Quản lý ca</option>
                </select>
              </label>
              <label>
                Chi nhánh
                <select name="venueId">
                  {w.state.venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Ngày làm
              <input name="date" type="date" required defaultValue={date} />
            </label>
            <div className="form-grid">
              <label>
                Bắt đầu
                <input name="start" type="time" defaultValue="07:00" required />
              </label>
              <label>
                Kết thúc
                <input name="end" type="time" defaultValue="15:00" required />
              </label>
            </div>
            <Submit busy={w.busy} label="Lưu ca làm" />
          </form>
        </Modal>
      )}
    </>
  );
}
export function Insights({ w, venue, act }: ViewProps) {
  const alerts = getAlerts(w.state, venue),
    [tab, setTab] = useState("alerts");
  const completed = w.state.orders.filter(
      (o) => paid(o) && inVenue(o.venueId, venue),
    ),
    revenue = completed.reduce((n, o) => n + o.total, 0);
  return (
    <>
      <div className="insight-banner">
        <span>
          <ChartSymbol />
        </span>
        <div>
          <h2>Dữ liệu có nguồn. Cảnh báo có việc cần làm.</h2>
          <p>
            Các cảnh báo hiện tại dựa trên ngưỡng tồn kho, để đội ngũ chủ động
            kiểm tra và xử lý.
          </p>
        </div>
        <Badge tone="green">Rule-based</Badge>
      </div>
      <div className="view-toolbar">
        <div className="segmented large">
          <button
            className={tab === "alerts" ? "selected" : ""}
            onClick={() => setTab("alerts")}
          >
            Cảnh báo vận hành
          </button>
          <button
            className={tab === "audit" ? "selected" : ""}
            onClick={() => setTab("audit")}
          >
            Nhật ký thao tác
          </button>
        </div>
        <Button
          onClick={() =>
            exportFile("RESTOCHAIN-tong-hop.csv", [
              ["Chỉ tiêu", "Giá trị"],
              ["Doanh thu đã thu", revenue],
              ["Đơn hoàn tất", completed.length],
              ["Nguyên liệu dưới ngưỡng", alerts.length],
            ])
          }
        >
          <ArrowDownToLine size={16} />
          Xuất tổng hợp
        </Button>
      </div>
      {tab === "alerts" ? (
        <section className="panel">
          <SectionHead
            title="Nguyên liệu cần kiểm tra"
            subtitle="Đánh dấu đã xem không làm biến mất tình trạng thiếu tồn kho."
          />
          {alerts.length ? (
            alerts.map((a) => (
              <div className="insight-alert" key={a.id}>
                <span className="attention-icon">
                  <TriangleAlert size={22} />
                </span>
                <div>
                  <strong>{a.title}</strong>
                  <p>
                    {a.detail} ·{" "}
                    {w.state.venues.find((v) => v.id === a.venueId)?.name}
                  </p>
                  <small>
                    Đề nghị: kiểm kê thực tế, đối chiếu công thức và bổ sung
                    nguyên liệu nếu cần.
                  </small>
                </div>
                {w.state.resolvedAlerts.includes(a.id) ? (
                  <Badge tone="green">Đã xem</Badge>
                ) : (
                  <Button
                    onClick={() =>
                      act(
                        { type: "ALERT_RESOLVE", payload: { id: a.id } },
                        "Đã ghi nhận người xem cảnh báo.",
                      )
                    }
                  >
                    Đã xem
                  </Button>
                )}
                <a className="icon-btn" aria-label="Mở kho" href="#/inventory">
                  <ArrowUpRight size={20} />
                </a>
              </div>
            ))
          ) : (
            <Empty title="Không có cảnh báo tồn kho" />
          )}
        </section>
      ) : (
        <section className="panel">
          <SectionHead
            title="Nhật ký gần nhất"
            subtitle="Các thao tác cập nhật được ghi lại cùng người thực hiện."
          />
          {w.state.audit.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Thời điểm</th>
                    <th>Người thực hiện</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {w.state.audit.slice(0, 100).map((a) => (
                    <tr key={a.id}>
                      <td>
                        {new Date(a.at).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                        })}
                      </td>
                      <td>{a.actor}</td>
                      <td>{a.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Chưa có thao tác mới"
              text="Hãy tạo đơn, điều chỉnh kho hoặc xác nhận một lượt đặt bàn."
            />
          )}
        </section>
      )}
    </>
  );
}
function ChartSymbol() {
  return <TrendingUp size={30} />;
}
export function SettingsPage({ w, act }: ViewProps) {
  const [reset, setReset] = useState(false),
    [invite, setInvite] = useState(false),
    [inviteError, setInviteError] = useState(""),
    [saving, setSaving] = useState(false);
  return (
    <div className="settings-grid">
      <section className="panel">
        <SectionHead title="Thông tin doanh nghiệp" />
        <form
          className="form modal-body"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            await act({
              type: "SETTINGS_SAVE",
              payload: { businessName: f.get("businessName") },
            });
          }}
        >
          <label>
            Tên hiển thị
            <input
              name="businessName"
              maxLength={80}
              defaultValue={w.state.businessName}
              required
            />
          </label>
          <div className="setting-note">
            <ShieldCheck size={19} />
            <p>
              {w.user
                ? "Dữ liệu được lưu trên máy chủ trong không gian doanh nghiệp của bạn."
                : "Bạn đang dùng dữ liệu minh họa lưu trên thiết bị này. Các thao tác không ảnh hưởng doanh nghiệp thực tế."}
            </p>
          </div>
          <Submit busy={w.busy} />
        </form>
      </section>
      <section className="panel">
        <SectionHead title="Tài khoản & cộng tác" />
        <div className="modal-body">
          {w.user ? (
            <>
              <p>
                <b>{w.user.name}</b> · {w.user.email}
              </p>
              <p className="muted">
                Trang khách hàng: /#/discover/{w.user.slug}
              </p>
              <div className="row-actions">
                <Button
                  onClick={() =>
                    navigator.clipboard
                      .writeText(
                        location.origin + "/#/discover/" + w.user!.slug,
                      )
                      .then(() => w.notify("Đã sao chép liên kết."))
                      .catch(() =>
                        w.notify("Trình duyệt không cho phép sao chép."),
                      )
                  }
                >
                  <Copy size={16} />
                  Sao chép
                </Button>
                {w.user.role === "owner" && (
                  <Button kind="primary" onClick={() => setInvite(true)}>
                    Thêm tài khoản
                  </Button>
                )}
              </div>
              <p className="muted small">
                Nhân viên có thể xử lý đơn và đặt bàn; quản lý được cập nhật
                kho, món, ca làm và hồ sơ khách.
              </p>
            </>
          ) : (
            <>
              <p>
                Đăng nhập để lưu dữ liệu dùng chung cho đội ngũ trên nhiều thiết
                bị.
              </p>
              <a className="btn primary" href="#/login">
                Đăng nhập doanh nghiệp <ArrowUpRight size={17} />
              </a>
              <p className="muted small">
                Cần hoàn tất cấu hình máy chủ theo README trong bộ mã nguồn.
              </p>
            </>
          )}
        </div>
      </section>
      <section className="panel">
        <SectionHead
          title="Thông tin chi nhánh"
          subtitle="Tên và địa chỉ này cũng xuất hiện trên trang đặt bàn của khách."
        />
        <div className="modal-body">
          {w.state.venues.map((v) => (
            <form
              className="form venue-edit-form"
              key={v.id}
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                await act({
                  type: "VENUE_SAVE",
                  payload: {
                    id: v.id,
                    name: f.get("name"),
                    area: f.get("area"),
                  },
                });
              }}
            >
              <Badge>{v.model === "cafe" ? "Café" : "Buffet"}</Badge>
              <label>
                Tên chi nhánh
                <input
                  name="name"
                  required
                  maxLength={80}
                  defaultValue={v.name}
                />
              </label>
              <label>
                Địa chỉ / khu vực
                <input
                  name="area"
                  required
                  maxLength={160}
                  defaultValue={v.area}
                />
              </label>
              {(!w.user || w.user.role === "owner") && (
                <Submit busy={w.busy} label="Lưu chi nhánh" />
              )}
            </form>
          ))}
        </div>
      </section>
      <section className="panel">
        <SectionHead title="Phạm vi bản bàn giao" />
        <div className="modal-body capability-list">
          <p>
            <CheckCircle2 size={18} />
            POS, tồn kho, đặt bàn và nhật ký thao tác
          </p>
          <p>
            <CheckCircle2 size={18} />
            Cổng khách hàng và gọi món trước khi đặt bàn
          </p>
          <p>
            <CheckCircle2 size={18} />
            Máy chủ đăng nhập, phân quyền, dữ liệu dùng chung
          </p>
          <p>
            <Clock size={18} />
            Chưa kết nối thanh toán, hóa đơn điện tử, SMS
          </p>
          <p>
            <Clock size={18} />
            Chưa có dự báo AI, FEFO theo lô hay ứng dụng native
          </p>
          <p className="muted">
            Các số liệu trên màn hình demo phục vụ trải nghiệm, không phải kết
            quả kinh doanh thực tế.
          </p>
        </div>
      </section>
      {!w.user && (
        <section className="panel">
          <SectionHead title="Dữ liệu trải nghiệm" />
          <div className="modal-body">
            <p>
              Khôi phục bộ dữ liệu mẫu ban đầu và xóa các thao tác demo đã lưu
              trên trình duyệt.
            </p>
            <Button kind="danger-outline" onClick={() => setReset(true)}>
              <RefreshCw size={16} />
              Khôi phục dữ liệu mẫu
            </Button>
          </div>
        </section>
      )}
      {reset && (
        <Modal title="Khôi phục dữ liệu mẫu?" onClose={() => setReset(false)}>
          <div className="modal-body">
            <p>
              Các đơn và lượt đặt thử do bạn tạo trên trình duyệt này sẽ bị xóa.
              Dữ liệu doanh nghiệp trên máy chủ không bị ảnh hưởng.
            </p>
            <div className="form-actions">
              <Button onClick={() => setReset(false)}>Giữ dữ liệu</Button>
              <Button
                kind="primary"
                onClick={() => {
                  w.resetDemo();
                  setReset(false);
                }}
              >
                Khôi phục
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {invite && (
        <Modal title="Thêm tài khoản nội bộ" onClose={() => setInvite(false)}>
          <form
            className="modal-body form"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setInviteError("");
              const f = new FormData(e.currentTarget);
              try {
                await api("member", {
                  name: f.get("name"),
                  email: f.get("email"),
                  password: f.get("password"),
                  role: f.get("role"),
                });
                setInvite(false);
                w.notify(
                  "Đã tạo tài khoản. Hãy chuyển mật khẩu cho thành viên qua kênh riêng.",
                );
              } catch (e) {
                setInviteError((e as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <label>
              Họ tên
              <input name="name" required maxLength={80} />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Mật khẩu ban đầu
              <input
                name="password"
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
              />
            </label>
            <label>
              Vai trò
              <select name="role">
                <option value="staff">Nhân viên</option>
                <option value="manager">Quản lý</option>
              </select>
            </label>
            {inviteError && <p className="form-error">{inviteError}</p>}
            <Submit busy={saving} label="Tạo tài khoản" />
          </form>
        </Modal>
      )}
    </div>
  );
}
