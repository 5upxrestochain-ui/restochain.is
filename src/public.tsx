import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Users,
  CalendarDays,
  Clock,
  Plug,
  VolumeX,
  Sun,
  Coffee,
  Plus,
  Minus,
  ShieldCheck,
  Layers3,
  Package,
  BarChart3,
  LayoutDashboard,
  Leaf,
  LockKeyhole,
} from "lucide-react";
import { Logo, Button, Badge, Submit, Empty, SectionHead } from "./components";
import { api, type Workspace } from "./workspace";
import {
  initialState,
  money,
  dateVN,
  dayOffset,
  displayDate,
  newId,
  slotAvailable,
  type State,
  type Booking,
} from "./domain";
export function Landing() {
  return (
    <div className="landing">
      <header className="public-nav">
        <Logo />
        <nav>
          <a href="#/dashboard">Không gian quản trị</a>
          <a href="#/discover">Trải nghiệm đặt bàn</a>
        </nav>
        <a className="btn primary" href="#/login">
          Đăng nhập <ArrowUpRight size={17} />
        </a>
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">RESTOCHAIN / BY 5UP</p>
            <h1>
              Một nhịp kết nối.
              <br />
              <em>Cả chuỗi vững vàng.</em>
            </h1>
            <p>
              Từ nguyên liệu trong kho đến một chiếc bàn khách yêu thích.
              RESTOCHAIN kết nối những điều nhỏ làm nên một trải nghiệm F&B tốt.
            </p>
            <div className="hero-actions">
              <a href="#/dashboard" className="btn primary large-btn">
                Khám phá không gian quản trị <ArrowUpRight size={19} />
              </a>
              <a href="#/discover" className="text-link">
                Tôi là thực khách <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-points">
              <span>
                <Check size={16} />
                Café & nhà hàng buffet
              </span>
              <span>
                <Check size={16} />
                Hai cổng trải nghiệm
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/cafe-interior.jpg"
              alt="Không gian cà phê nhiều ánh sáng với cây xanh và bàn gỗ"
            />
            <div className="hero-image-label">
              Không gian tốt bắt đầu từ sự thấu hiểu.
            </div>
            <div className="hero-connection">
              <span>
                <Package size={18} />
                Nguyên liệu
              </span>
              <ArrowRight size={17} />
              <span>
                <Coffee size={18} />
                Phục vụ
              </span>
              <ArrowRight size={17} />
              <span>
                <Users size={18} />
                Trải nghiệm
              </span>
            </div>
            <small className="photo-caption">
              Ảnh minh họa · Việt Anh Nguyễn / Pexels
            </small>
          </div>
        </section>
        <section className="landing-section">
          <div className="section-heading-wide">
            <p className="eyebrow">KHÔNG CHỈ MỘT MÀN HÌNH TÍNH TIỀN</p>
            <h2>
              Nhìn thấy toàn cảnh.
              <br />
              Xử lý đúng việc.
            </h2>
            <p>
              Một không gian làm việc cho những người đứng sau mỗi ca phục vụ.
            </p>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: Layers3,
                n: "01",
                title: "Bán hàng liền mạch",
                text: "Đơn hàng, định lượng và tồn kho được liên kết. Mỗi lần cập nhật đều có dấu vết.",
              },
              {
                icon: Package,
                n: "02",
                title: "Chủ động nguyên liệu",
                text: "Theo dõi tồn kho từng chi nhánh, xuất theo công thức café hoặc ghi nhận mẻ buffet.",
              },
              {
                icon: MapPin,
                n: "03",
                title: "Đúng bàn, đúng nhu cầu",
                text: "Đặt chỗ theo số người, độ yên tĩnh, ánh sáng và ổ cắm. Gửi món trước khi đến.",
              },
              {
                icon: BarChart3,
                n: "04",
                title: "Quản lý bằng dữ liệu",
                text: "Tổng hợp doanh thu đã thu, lịch làm việc và cảnh báo tồn kho để biết việc cần làm.",
              },
            ].map((f) => (
              <article key={f.n}>
                <span className="feature-top">
                  <f.icon size={27} />
                  <span>{f.n}</span>
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-dual">
          <div>
            <p className="eyebrow">TỪ QUẦY THU NGÂN ĐẾN CHIẾC BÀN</p>
            <h2>
              Vận hành tốt hơn.
              <br />
              Đón khách chu đáo hơn.
            </h2>
            <p>
              Doanh nghiệp làm việc trên Business Portal. Khách chọn không gian
              và gửi yêu cầu trên Customer Portal. Hai trải nghiệm, cùng một
              dòng dữ liệu.
            </p>
            <a href="#/discover" className="btn light-btn">
              Thử hành trình đặt bàn <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="journey-card">
            <span className="journey-step">
              <span>01</span>
              <div>
                <strong>Chọn không gian</strong>
                <p>Yên tĩnh, gần cửa sổ, đủ chỗ cho cả nhóm.</p>
              </div>
            </span>
            <span className="journey-step">
              <span>02</span>
              <div>
                <strong>Gửi yêu cầu đặt bàn</strong>
                <p>Chọn thời gian và món muốn dùng trước.</p>
              </div>
            </span>
            <span className="journey-step">
              <span>03</span>
              <div>
                <strong>Đội ngũ xác nhận</strong>
                <p>Thông tin xuất hiện trong lịch phục vụ.</p>
              </div>
            </span>
          </div>
        </section>
        <section className="landing-section pricing-section">
          <div className="section-heading-wide">
            <p className="eyebrow">LỘ TRÌNH THƯƠNG MẠI</p>
            <h2>Lớn lên cùng từng điểm bán.</h2>
            <p>
              Mức phí dưới đây là đề xuất trong kế hoạch kinh doanh, chưa mở
              đăng ký thanh toán.
            </p>
          </div>
          <div className="pricing-grid">
            {[
              {
                name: "Starter",
                price: "249.000",
                text: "Nghiệp vụ thiết yếu tại điểm bán",
                items: [
                  "Bán hàng & danh mục món",
                  "Quản lý nguyên liệu",
                  "Báo cáo vận hành cơ bản",
                ],
              },
              {
                name: "Growth",
                price: "499.000",
                text: "Kết nối đội ngũ và trải nghiệm",
                items: [
                  "Các nghiệp vụ Starter",
                  "Bàn, đặt chỗ & khách hàng",
                  "Phân quyền & cảnh báo",
                ],
              },
              {
                name: "Chain",
                price: "799.000",
                text: "Dành cho vận hành nhiều chi nhánh",
                items: [
                  "Các nghiệp vụ Growth",
                  "Tổng hợp dữ liệu chuỗi",
                  "Triển khai theo phạm vi thỏa thuận",
                ],
              },
            ].map((p, i) => (
              <article
                key={p.name}
                className={"price-card " + (i === 1 ? "highlight" : "")}
              >
                <Badge tone={i === 1 ? "green" : ""}>Giá dự kiến</Badge>
                <h3>{p.name}</h3>
                <p>{p.text}</p>
                <div className="price">
                  {p.price}
                  <span>đ / điểm / tháng</span>
                </div>
                <ul>
                  {p.items.map((item) => (
                    <li key={item}>
                      <Check size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  className={"btn " + (i === 1 ? "primary" : "")}
                  href="#/dashboard"
                >
                  Trải nghiệm giao diện <ArrowUpRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <Logo />
        <p>RESTOCHAIN · Dự án của nhóm 5UP</p>
        <a href="#/dashboard">
          Mở không gian trải nghiệm <ArrowUpRight size={16} />
        </a>
      </footer>
    </div>
  );
}
export function Auth({ w }: { w: Workspace }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      if (register)
        await w.signup(
          String(f.get("name")),
          String(f.get("email")),
          String(f.get("password")),
          String(f.get("businessName")),
          String(f.get("code")),
        );
      else await w.login(String(f.get("email")), String(f.get("password")));
      location.hash = "/dashboard";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Logo light />
        <div>
          <p className="eyebrow">MỖI NGÀY MỘT NHỊP TỐT HƠN</p>
          <h1>
            Dành thời gian
            <br />
            cho điều bạn
            <br />
            <em>làm tốt nhất.</em>
          </h1>
          <p>RESTOCHAIN giúp đội ngũ kết nối những việc còn lại.</p>
        </div>
        <span className="auth-bottom">F&B OPERATIONS, CONNECTED.</span>
      </aside>
      <main className="auth-main">
        <a href="#/dashboard" className="text-link">
          <ArrowLeft size={16} />
          Về bản trải nghiệm
        </a>
        <div className="auth-card">
          <span className="auth-icon">
            <LockKeyhole size={25} />
          </span>
          <h1>{register ? "Tạo không gian mới" : "Chào mừng trở lại."}</h1>
          <p>
            {register
              ? "Tài khoản đầu tiên sẽ là chủ doanh nghiệp."
              : "Đăng nhập để tiếp tục cùng đội ngũ của bạn."}
          </p>
          <form className="form" onSubmit={submit}>
            {register && (
              <>
                <label>
                  Tên của bạn
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Tên doanh nghiệp
                  <input
                    name="businessName"
                    autoComplete="organization"
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Mã tạo doanh nghiệp
                  <input
                    name="code"
                    type="password"
                    autoComplete="off"
                    minLength={16}
                    maxLength={200}
                    required
                    placeholder="Mã riêng do chủ dự án cung cấp"
                  />
                </label>
              </>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="ban@doanhnghiep.vn"
                autoComplete="email"
                required
                maxLength={180}
              />
            </label>
            <label>
              Mật khẩu
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                minLength={register ? 12 : 1}
                maxLength={128}
                required
                placeholder={
                  register ? "Tối thiểu 12 ký tự" : "Nhập mật khẩu của bạn"
                }
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Submit
              busy={busy}
              label={register ? "Tạo không gian doanh nghiệp" : "Đăng nhập"}
            />
          </form>
          <button
            className="auth-switch"
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có không gian? Đăng ký"}
          </button>
          <div className="auth-note">
            <ShieldCheck size={18} />
            <span>
              Bạn có thể dùng bản trải nghiệm ngay. Tài khoản doanh nghiệp cần
              máy chủ được cấu hình theo hướng dẫn bàn giao.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
export function CustomerPortal({ w, slug }: { w: Workspace; slug?: string }) {
  const [catalog, setCatalog] = useState<State | null>(slug ? null : w.state),
    [loading, setLoading] = useState(!!slug),
    [loadError, setLoadError] = useState(""),
    [venue, setVenue] = useState("v1"),
    [guests, setGuests] = useState(2),
    [date, setDate] = useState(dayOffset(1)),
    [time, setTime] = useState("10:00"),
    [need, setNeed] = useState("Gặp gỡ bạn bè"),
    [selected, setSelected] = useState(""),
    [cart, setCart] = useState<Record<string, number>>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirmed, setConfirmed] = useState<Booking | null>(null);
  useEffect(() => {
    if (!slug) {
      setCatalog(w.state);
      return;
    }
    let active = true;
    setLoading(true);
    api("public", undefined, "&slug=" + encodeURIComponent(slug))
      .then((d) => {
        if (active) {
          setCatalog(d.state);
          setVenue(d.state.venues[0]?.id || "v1");
        }
      })
      .catch((e) => active && setLoadError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, w.state]);
  useEffect(() => {
    setSelected("");
  }, [venue, guests, date, time, need]);
  const s = catalog || initialState(false),
    v = s.venues.find((v) => v.id === venue),
    tables = s.tables.filter(
      (t) =>
        t.venueId === venue &&
        t.seats >= guests &&
        (need !== "Làm việc yên tĩnh" || (t.quiet && t.power)),
    ),
    chosen = s.tables.find((t) => t.id === selected),
    total = s.products.reduce((n, p) => n + p.price * (cart[p.id] || 0), 0);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!selected) {
      setError("Vui lòng chọn một bàn còn trống.");
      return;
    }
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const payload = {
      id: newId(),
      venueId: venue,
      tableId: selected,
      guests,
      date,
      time,
      need,
      name: String(f.get("name")),
      phone: String(f.get("phone")),
      note: String(f.get("note") || ""),
      items: Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    };
    try {
      if (slug) {
        const d = await api("book", { slug, payload, consent: true });
        setConfirmed(d.booking);
      } else {
        const updated = await w.dispatch({ type: "BOOKING_CREATE", payload });
        setConfirmed(updated.bookings.find((b) => b.id === payload.id) || null);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="customer-site">
      <header className="public-nav">
        <Logo />
        <div className="customer-nav">
          <a href="#/intro">Về RESTOCHAIN</a>
          <a className="btn" href="#/dashboard">
            Cổng doanh nghiệp <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      {loading ? (
        <main className="customer-container">
          <Empty title="Đang tải không gian…" />
        </main>
      ) : loadError ? (
        <main className="customer-container">
          <Empty title="Chưa thể mở trang đặt bàn" text={loadError} />
          <a className="btn" href="#/discover">
            Thử không gian mẫu
          </a>
        </main>
      ) : confirmed ? (
        <main className="confirmation">
          <span className="confirmation-icon">
            <CheckCircle2 size={42} />
          </span>
          <Badge tone="amber">Chờ nhà hàng xác nhận</Badge>
          <h1>
            Hẹn bạn ở một
            <br />
            không gian thật vừa ý.
          </h1>
          <p>
            Yêu cầu đã được{" "}
            {slug ? "gửi đến nhà hàng" : "lưu trong bản trải nghiệm"}. Bàn chỉ
            được xác nhận khi đội ngũ tiếp nhận.
          </p>
          <div className="confirmation-card">
            <h2>{v?.name}</h2>
            <div>
              <CalendarDays size={19} />
              {displayDate(confirmed.date)} · {confirmed.time}
            </div>
            <div>
              <Users size={19} />
              {confirmed.guests} khách · {chosen?.name}
            </div>
            <div>
              <MapPin size={19} />
              {confirmed.need}
            </div>
            <div>
              <Clock size={19} />
              Thời lượng dự kiến: {confirmed.duration} phút
            </div>
            {total > 0 && (
              <div>
                <Coffee size={19} />
                Món đặt trước: {money(total)} · chưa thu tiền
              </div>
            )}
            <hr />
            <strong>{confirmed.name}</strong>
            <span>{confirmed.phone}</span>
            <small>Mã yêu cầu: {confirmed.id.slice(0, 8).toUpperCase()}</small>
          </div>
          <div className="hero-actions">
            <Button
              kind="primary"
              onClick={() => {
                setConfirmed(null);
                setSelected("");
                setCart({});
              }}
            >
              Đặt thêm một lượt
            </Button>
            <a className="btn" href="#/reservations">
              Xem cổng doanh nghiệp <ArrowUpRight size={16} />
            </a>
          </div>
        </main>
      ) : (
        <main className="customer-container">
          <div className="customer-title">
            <p className="eyebrow">MỘT CHỖ NGỒI. NHIỀU ĐIỀU ĐÁNG NHỚ.</p>
            <h1>
              Chọn không gian
              <br />
              <em>đúng với bạn.</em>
            </h1>
            <p>
              Một góc yên tĩnh để làm việc, hay một chiếc bàn đủ rộng cho những
              cuộc gặp.
            </p>
          </div>
          <section className="venue-showcase">
            <img
              src="/cafe-interior.jpg"
              alt="Không gian cà phê với bàn gỗ, cây xanh và ánh sáng tự nhiên"
            />
            <div className="venue-info">
              <Badge tone="green">
                {slug ? "Trang đặt bàn" : "Địa điểm minh họa"}
              </Badge>
              <h2>{v?.name}</h2>
              <p>
                <MapPin size={17} />
                {v?.area}
              </p>
              <div className="venue-tags">
                <span>
                  <VolumeX size={16} />
                  Góc yên tĩnh
                </span>
                <span>
                  <Plug size={16} />
                  Bàn có ổ cắm
                </span>
                <span>
                  <Sun size={16} />
                  Ánh sáng tự nhiên
                </span>
              </div>
              <label>
                Địa điểm
                <select
                  value={venue}
                  onChange={(e) => {
                    setVenue(e.target.value);
                    setCart({});
                  }}
                >
                  {s.venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              <small>Ảnh minh họa không gian · Việt Anh Nguyễn / Pexels</small>
            </div>
          </section>
          <div className="customer-booking-grid">
            <div>
              <section className="panel">
                <SectionHead title="01. Cuộc hẹn của bạn" />
                <div className="modal-body">
                  <div className="form-grid booking-fields">
                    <label>
                      Ngày đến
                      <input
                        type="date"
                        aria-label="Ngày đến"
                        value={date}
                        min={dateVN()}
                        max={dayOffset(60)}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </label>
                    <label>
                      Giờ đến
                      <select
                        aria-label="Giờ đến"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      >
                        {[
                          "08:00",
                          "09:00",
                          "10:00",
                          "11:00",
                          "12:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                          "17:00",
                          "18:00",
                          "19:00",
                          "20:00",
                          "21:00",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Số người
                      <select
                        aria-label="Số người"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} người
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="field-caption">
                    Bạn muốn một không gian như thế nào?
                  </p>
                  <div className="need-options">
                    {[
                      "Gặp gỡ bạn bè",
                      "Làm việc yên tĩnh",
                      "Đi cùng gia đình",
                    ].map((n) => (
                      <button
                        key={n}
                        className={need === n ? "active" : ""}
                        onClick={() => setNeed(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              <section className="panel">
                <SectionHead
                  title="02. Chọn chiếc bàn phù hợp"
                  subtitle="Gợi ý theo nhu cầu bạn chọn · Mỗi lượt dự kiến 120 phút"
                />
                <div className="customer-tables">
                  {tables.map((t) => {
                    const available = slotAvailable(s, t.id, date, time);
                    return (
                      <button
                        key={t.id}
                        disabled={!available}
                        className={
                          "table-choice " +
                          (selected === t.id ? "selected" : "")
                        }
                        onClick={() => setSelected(t.id)}
                      >
                        <span className="table-choice-top">
                          <b>{t.name}</b>
                          {selected === t.id ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <span>
                              {available ? "Còn trống" : "Đã có lịch"}
                            </span>
                          )}
                        </span>
                        <strong>{t.zone}</strong>
                        <p>{t.seats} chỗ ngồi</p>
                        <div>
                          {t.power && (
                            <span title="Có ổ cắm">
                              <Plug size={16} />
                            </span>
                          )}
                          {t.quiet && (
                            <span title="Yên tĩnh">
                              <VolumeX size={16} />
                            </span>
                          )}
                          {t.window && (
                            <span title="Gần cửa sổ">
                              <Sun size={16} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {!tables.length && (
                    <Empty
                      title="Chưa có bàn phù hợp"
                      text="Thử đổi số người hoặc nhu cầu không gian."
                    />
                  )}
                </div>
              </section>
              {v?.model === "cafe" && (
                <section className="panel">
                  <SectionHead
                    title="03. Một chút ngon lành, đặt trước?"
                    subtitle="Không bắt buộc. Món được ghi kèm yêu cầu đặt bàn và chưa thanh toán."
                  />
                  <div className="preorder-list">
                    {s.products.slice(0, 6).map((p) => (
                      <div className="preorder-item" key={p.id}>
                        <span
                          className="product-mini-icon"
                          style={{ background: p.color }}
                        >
                          {p.category === "Cà phê" ? (
                            <Coffee size={22} />
                          ) : (
                            <Leaf size={22} />
                          )}
                        </span>
                        <div>
                          <strong>{p.name}</strong>
                          <small>{money(p.price)}</small>
                        </div>
                        <div className="qty-control">
                          <button
                            aria-label={"Bớt " + p.name}
                            disabled={!cart[p.id]}
                            onClick={() =>
                              setCart({
                                ...cart,
                                [p.id]: Math.max(0, (cart[p.id] || 0) - 1),
                              })
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span>{cart[p.id] || 0}</span>
                          <button
                            aria-label={"Thêm " + p.name}
                            onClick={() =>
                              setCart({
                                ...cart,
                                [p.id]: Math.min(20, (cart[p.id] || 0) + 1),
                              })
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <aside className="panel booking-summary">
              <SectionHead title="Thông tin đặt bàn" />
              <div className="summary-details">
                <p>
                  <MapPin size={18} />
                  {v?.name}
                </p>
                <p>
                  <CalendarDays size={18} />
                  {date ? displayDate(date) : "Chọn ngày"} · {time}
                </p>
                <p>
                  <Users size={18} />
                  {guests} người · {chosen ? chosen.name : "Chưa chọn bàn"}
                </p>
                <p>
                  <Coffee size={18} />
                  Món đặt trước: {money(total)}
                </p>
              </div>
              <form className="form" onSubmit={submit}>
                <label>
                  Họ và tên
                  <input
                    name="name"
                    placeholder="Tên để nhà hàng đón bạn"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Số điện thoại
                  <input
                    name="phone"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    autoComplete="tel"
                    required
                    pattern="(0[0-9]{9}|\+84[0-9]{9})"
                    maxLength={15}
                  />
                </label>
                <label>
                  Ghi chú <span className="muted">(không bắt buộc)</span>
                  <textarea
                    name="note"
                    maxLength={300}
                    rows={3}
                    placeholder="Bạn cần nhà hàng chuẩn bị gì thêm?"
                  />
                </label>
                <label className="check-label">
                  <input type="checkbox" required />
                  Tôi đồng ý cung cấp tên và số điện thoại để nhà hàng xử lý yêu
                  cầu đặt bàn này.
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <Submit busy={busy} label="Gửi yêu cầu đặt bàn" />
                <p className="booking-note">
                  <ShieldCheck size={16} />
                  Chưa thu tiền hoặc tiền cọc trên website.
                </p>
              </form>
              {!slug && (
                <p className="demo-customer-note">
                  Chế độ trải nghiệm: yêu cầu chỉ lưu trong trình duyệt, không
                  được gửi tới một nhà hàng thật.
                </p>
              )}
            </aside>
          </div>
        </main>
      )}
      <footer className="customer-footer">
        <Logo />
        <span>Kết nối không gian, kết nối trải nghiệm.</span>
        <a
          href="https://www.pexels.com/photo/cozy-cafe-interior-with-natural-light-and-plants-31133774/"
          target="_blank"
          rel="noreferrer"
        >
          Nguồn ảnh minh họa
        </a>
      </footer>
    </div>
  );
}
