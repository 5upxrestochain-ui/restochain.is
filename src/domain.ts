export type Role = "owner" | "manager" | "staff";
export type Venue = {
  id: string;
  name: string;
  area: string;
  model: "cafe" | "buffet";
};
export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
  cost: number;
  venueId: string;
};
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string;
  bom: { ingredientId: string; quantity: number }[];
};
export type Order = {
  id: string;
  code: string;
  venueId: string;
  table: string;
  customer: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    bom?: Product["bom"];
  }[];
  total: number;
  status: "preparing" | "completed" | "cancelled";
  payment: "unpaid" | "cash";
  createdAt: string;
  settledAt?: string;
};
export type Booking = {
  id: string;
  venueId: string;
  tableId: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  duration: number;
  need: string;
  note: string;
  status: "pending" | "confirmed" | "arrived" | "cancelled";
  createdAt: string;
  items: {
    productId: string;
    quantity: number;
    price?: number;
    name?: string;
  }[];
  total: number;
  orderId?: string;
};
export type Table = {
  id: string;
  venueId: string;
  name: string;
  seats: number;
  zone: string;
  power: boolean;
  quiet: boolean;
  window: boolean;
};
export type Customer = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spend: number;
  lastVisit: string;
  marketingConsent: boolean;
};
export type Shift = {
  id: string;
  name: string;
  role: string;
  venueId: string;
  date: string;
  start: string;
  end: string;
  status: "scheduled" | "checked-in" | "completed";
};
export type Audit = { id: string; at: string; actor: string; message: string };
export type State = {
  version: 1;
  businessName: string;
  venues: Venue[];
  ingredients: Ingredient[];
  products: Product[];
  orders: Order[];
  bookings: Booking[];
  tables: Table[];
  customers: Customer[];
  shifts: Shift[];
  audit: Audit[];
  resolvedAlerts: string[];
};
export type Action = { type: string; payload: Record<string, unknown> };
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
export const dateVN = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export function dayOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateVN(d);
}
export const newId = () => crypto.randomUUID();
export const displayDate = (d: string) =>
  !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
  !Number.isFinite(Date.parse(d + "T12:00:00+07:00"))
    ? "Chọn ngày"
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(d + "T12:00:00+07:00"));
export function initialState(
  demo = true,
  businessName = "Mộc Collective",
): State {
  const venues: Venue[] = [
    {
      id: "v1",
      name: "Mộc · Trúc Bạch",
      area: "Ba Đình, Hà Nội",
      model: "cafe",
    },
    {
      id: "v2",
      name: "Mộc · Cầu Giấy",
      area: "Cầu Giấy, Hà Nội",
      model: "cafe",
    },
    {
      id: "v3",
      name: "Bếp Mộc · Tây Hồ",
      area: "Tây Hồ, Hà Nội",
      model: "buffet",
    },
  ];
  const products: Product[] = [
    {
      id: "p1",
      name: "Cà phê sữa đá",
      category: "Cà phê",
      price: 45000,
      color: "#e8d9c5",
      bom: [
        { ingredientId: "i1", quantity: 0.02 },
        { ingredientId: "i2", quantity: 0.04 },
      ],
    },
    {
      id: "p2",
      name: "Latte hạt dẻ",
      category: "Cà phê",
      price: 65000,
      color: "#e5dbcf",
      bom: [
        { ingredientId: "i1", quantity: 0.02 },
        { ingredientId: "i2", quantity: 0.18 },
      ],
    },
    {
      id: "p3",
      name: "Cold brew cam",
      category: "Cà phê",
      price: 59000,
      color: "#f5dec4",
      bom: [
        { ingredientId: "i1", quantity: 0.025 },
        { ingredientId: "i3", quantity: 0.1 },
      ],
    },
    {
      id: "p4",
      name: "Matcha latte",
      category: "Trà & Matcha",
      price: 65000,
      color: "#dce8ca",
      bom: [
        { ingredientId: "i4", quantity: 0.005 },
        { ingredientId: "i2", quantity: 0.18 },
      ],
    },
    {
      id: "p5",
      name: "Trà đào cam sả",
      category: "Trà & Matcha",
      price: 55000,
      color: "#f9e5c4",
      bom: [
        { ingredientId: "i3", quantity: 0.15 },
        { ingredientId: "i5", quantity: 0.01 },
      ],
    },
    {
      id: "p6",
      name: "Trà sen vàng",
      category: "Trà & Matcha",
      price: 59000,
      color: "#e5ead8",
      bom: [
        { ingredientId: "i5", quantity: 0.012 },
        { ingredientId: "i2", quantity: 0.04 },
      ],
    },
    {
      id: "p7",
      name: "Croissant bơ",
      category: "Bánh ngọt",
      price: 39000,
      color: "#f0dbba",
      bom: [{ ingredientId: "i6", quantity: 1 }],
    },
    {
      id: "p8",
      name: "Set sáng Mộc",
      category: "Bánh ngọt",
      price: 79000,
      color: "#eedbcf",
      bom: [
        { ingredientId: "i1", quantity: 0.02 },
        { ingredientId: "i2", quantity: 0.04 },
        { ingredientId: "i6", quantity: 1 },
      ],
    },
  ];
  const ingredients: Ingredient[] = venues
    .filter((v) => v.model === "cafe")
    .flatMap((v, ix) =>
      [
        {
          id: "i1",
          name: "Hạt cà phê Arabica",
          unit: "kg",
          stock: ix ? 4.2 : 2.4,
          min: 3,
          cost: 320000,
        },
        {
          id: "i2",
          name: "Sữa tươi",
          unit: "lít",
          stock: ix ? 18 : 6.8,
          min: 10,
          cost: 32000,
        },
        {
          id: "i3",
          name: "Cam tươi",
          unit: "kg",
          stock: 12.5,
          min: 5,
          cost: 45000,
        },
        {
          id: "i4",
          name: "Bột matcha",
          unit: "kg",
          stock: 0.85,
          min: 0.5,
          cost: 850000,
        },
        {
          id: "i5",
          name: "Trà lài",
          unit: "kg",
          stock: 2.2,
          min: 1,
          cost: 280000,
        },
        {
          id: "i6",
          name: "Croissant",
          unit: "chiếc",
          stock: 32,
          min: 15,
          cost: 18000,
        },
      ].map((x) => ({ ...x, venueId: v.id })),
    );
  ingredients.push(
    {
      id: "b1",
      name: "Thịt bò buffet",
      unit: "kg",
      stock: 15,
      min: 8,
      cost: 180000,
      venueId: "v3",
    },
    {
      id: "b2",
      name: "Rau củ buffet",
      unit: "kg",
      stock: 22,
      min: 10,
      cost: 28000,
      venueId: "v3",
    },
  );
  const tables: Table[] = venues.flatMap((v) =>
    Array.from({ length: 8 }, (_, i) => ({
      id: v.id + "-t" + (i + 1),
      venueId: v.id,
      name: "B" + String(i + 1).padStart(2, "0"),
      seats: i < 3 ? 2 : i < 6 ? 4 : 6,
      zone: i < 3 ? "Cửa sổ" : i < 6 ? "Trung tâm" : "Riêng tư",
      power: i < 3,
      quiet: i < 3 || i > 5,
      window: i < 3,
    })),
  );
  const orders: Order[] = [];
  if (demo)
    for (let day = -6; day <= 0; day++)
      for (let i = 0; i < 14 + (day + 6) * 2; i++) {
        const product = products[i % products.length],
          qty = (i % 3) + 1,
          venueId = i % 3 === 0 ? "v2" : "v1";
        const createdAt =
          dayOffset(day) +
          "T" +
          String(8 + (i % 12)).padStart(2, "0") +
          ":" +
          String((i * 7) % 60).padStart(2, "0") +
          ":00+07:00";
        orders.push({
          id: "sample-" + day + "-" + i,
          code: "RC-" + String(1080 + orders.length),
          venueId,
          table: "B" + String((i % 8) + 1).padStart(2, "0"),
          customer: i % 3 ? "Khách tại quán" : "Khánh Linh",
          items: [
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: qty,
            },
          ],
          total: product.price * qty,
          status: day === 0 && i > 21 ? "preparing" : "completed",
          payment: day === 0 && i > 21 ? "unpaid" : "cash",
          createdAt,
          settledAt: createdAt,
        });
      }
  const bookings: Booking[] = demo
    ? [
        {
          id: "sample-booking-1",
          venueId: "v1",
          tableId: "v1-t4",
          name: "Nguyễn Khánh Linh",
          phone: "0900000001",
          guests: 4,
          date: dateVN(),
          time: "18:00",
          duration: 120,
          need: "Gặp gỡ bạn bè",
          note: "Có một em bé đi cùng.",
          status: "confirmed",
          createdAt: new Date().toISOString(),
          items: [],
          total: 0,
        },
        {
          id: "sample-booking-2",
          venueId: "v1",
          tableId: "v1-t1",
          name: "Trần Minh Anh",
          phone: "0900000002",
          guests: 2,
          date: dateVN(),
          time: "19:30",
          duration: 120,
          need: "Làm việc yên tĩnh",
          note: "Ưu tiên bàn có ổ cắm.",
          status: "pending",
          createdAt: new Date().toISOString(),
          items: [],
          total: 0,
        },
      ]
    : [];
  const customers: Customer[] = demo
    ? [
        {
          id: "c1",
          name: "Nguyễn Khánh Linh",
          phone: "0900000001",
          visits: 18,
          spend: 2640000,
          lastVisit: dateVN(),
          marketingConsent: false,
        },
        {
          id: "c2",
          name: "Trần Minh Anh",
          phone: "0900000002",
          visits: 12,
          spend: 1830000,
          lastVisit: dayOffset(-2),
          marketingConsent: true,
        },
        {
          id: "c3",
          name: "Lê Hoàng Nam",
          phone: "0900000003",
          visits: 8,
          spend: 960000,
          lastVisit: dayOffset(-5),
          marketingConsent: false,
        },
        {
          id: "c4",
          name: "Phạm Ngọc Mai",
          phone: "0900000004",
          visits: 23,
          spend: 3680000,
          lastVisit: dayOffset(-1),
          marketingConsent: true,
        },
      ]
    : [];
  const shifts: Shift[] = demo
    ? [
        {
          id: "s1",
          name: "Ngọc Mai",
          role: "Quản lý ca",
          venueId: "v1",
          date: dateVN(),
          start: "07:00",
          end: "15:00",
          status: "checked-in",
        },
        {
          id: "s2",
          name: "Hoàng Nam",
          role: "Pha chế",
          venueId: "v1",
          date: dateVN(),
          start: "07:00",
          end: "15:00",
          status: "checked-in",
        },
        {
          id: "s3",
          name: "Khánh An",
          role: "Thu ngân",
          venueId: "v1",
          date: dateVN(),
          start: "15:00",
          end: "23:00",
          status: "scheduled",
        },
      ]
    : [];
  const state: State = {
    version: 1,
    businessName,
    venues,
    ingredients,
    products,
    orders,
    bookings,
    tables,
    customers,
    shifts,
    audit: [],
    resolvedAlerts: [],
  };
  if (!demo) {
    state.venues = [
      { id: "v1", name: "Chi nhánh chính", area: "Hà Nội", model: "cafe" },
    ];
    state.tables = state.tables.filter((t) => t.venueId === "v1");
    state.ingredients = state.ingredients
      .filter((i) => i.venueId === "v1")
      .map((i) => ({ ...i, stock: 0 }));
  }
  return state;
}
function str(value: unknown, label: string, max = 160) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw Error(label + " không hợp lệ.");
  return value.trim();
}
function num(value: unknown, label: string, min = 0, max = 100000000) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw Error(label + " không hợp lệ.");
  return value;
}
function count(value: unknown, label: string, min = 1, max = 100) {
  const n = num(value, label, min, max);
  if (!Number.isInteger(n)) throw Error(label + " phải là số nguyên.");
  return n;
}
function validDate(value: string) {
  const time = Date.parse(value + "T12:00:00Z");
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value
  );
}
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const nextOrderCode = (s: State) =>
  "RC-" +
  (Math.max(
    1000,
    ...s.orders.map((o) => Number(o.code.replace(/^RC-/, "")) || 0),
  ) +
    1);
const phoneValue = (value: unknown) => {
  const phone = str(value, "Số điện thoại", 15).replace(/^\+84/, "0");
  if (!/^0\d{9}$/.test(phone))
    throw Error("Nhập số điện thoại Việt Nam hợp lệ.");
  return phone;
};
export function slotAvailable(
  s: State,
  tableId: string,
  date: string,
  time: string,
  duration = 120,
  except?: string,
) {
  if (!validDate(date) || !validTime(time)) return false;
  const start = Date.parse(date + "T" + time + ":00+07:00"),
    end = start + duration * 60000;
  return !s.bookings.some((b) => {
    if (b.id === except || b.tableId !== tableId || b.status === "cancelled")
      return false;
    if (
      b.status === "pending" &&
      Date.now() - Date.parse(b.createdAt) > 30 * 60000
    )
      return false;
    const t = Date.parse(b.date + "T" + b.time + ":00+07:00");
    return start < t + b.duration * 60000 && end > t;
  });
}
export function applyAction(
  source: State,
  action: Action,
  actor = "Nhóm vận hành",
  role: Role = "owner",
): State {
  const s = structuredClone(source),
    p = action.payload;
  let message = "";
  const manage = [
    "STOCK_ADJUST",
    "PRODUCT_SAVE",
    "CUSTOMER_ADD",
    "SHIFT_ADD",
    "SETTINGS_SAVE",
  ];
  if (role === "staff" && manage.includes(action.type))
    throw Error("Tài khoản này không có quyền thực hiện thao tác.");
  switch (action.type) {
    case "ORDER_CREATE": {
      const id = str(p.id, "Mã đơn", 80);
      if (s.orders.some((o) => o.id === id)) return source;
      const venue = s.venues.find((v) => v.id === p.venueId);
      if (!venue) throw Error("Chọn chi nhánh hợp lệ.");
      if (venue.model === "buffet")
        throw Error(
          "Chi nhánh buffet quản lý xuất nguyên liệu theo mẻ tại mục Kho. POS gọi món hiện dành cho quán cà phê.",
        );
      if (!Array.isArray(p.items) || !p.items.length || p.items.length > 50)
        throw Error("Giỏ hàng cần có từ 1 đến 50 dòng món.");
      const items = p.items.map((x) => {
        const product = s.products.find((a) => a.id === x.productId);
        if (!product) throw Error("Món không tồn tại.");
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: count(x.quantity, "Số lượng"),
          bom: structuredClone(product.bom),
        };
      });
      const total = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
      s.orders.unshift({
        id,
        code: nextOrderCode(s),
        venueId: venue.id,
        table: str(p.table || "Mang đi", "Bàn", 40),
        customer: str(p.customer || "Khách tại quán", "Tên khách", 80),
        items,
        total,
        status: "preparing",
        payment: "unpaid",
        createdAt: new Date().toISOString(),
      });
      message = "Tạo đơn hàng " + s.orders[0].code;
      break;
    }
    case "ORDER_SETTLE": {
      const o = s.orders.find((x) => x.id === p.id);
      if (!o) throw Error("Không tìm thấy đơn hàng.");
      if (o.status === "completed") return source;
      if (o.status === "cancelled") throw Error("Đơn đã hủy.");
      const needs = new Map<string, number>();
      for (const item of o.items) {
        const product = s.products.find((x) => x.id === item.productId);
        if (!product) throw Error("Thiếu công thức món.");
        for (const b of item.bom || product.bom)
          needs.set(
            b.ingredientId,
            (needs.get(b.ingredientId) || 0) + b.quantity * item.quantity,
          );
      }
      for (const [id, quantity] of needs) {
        const i = s.ingredients.find(
          (x) => x.id === id && x.venueId === o.venueId,
        );
        if (!i || i.stock + 0.00001 < quantity)
          throw Error(
            "Không đủ tồn kho: " +
              (i?.name || id) +
              ". Hãy nhập kho hoặc kiểm tra công thức.",
          );
      }
      for (const [id, quantity] of needs) {
        const i = s.ingredients.find(
          (x) => x.id === id && x.venueId === o.venueId,
        )!;
        i.stock = Math.max(0, Math.round((i.stock - quantity) * 10000) / 10000);
      }
      o.status = "completed";
      o.payment = "cash";
      o.settledAt = new Date().toISOString();
      message = "Xác nhận thu tiền mặt và xuất kho cho " + o.code;
      break;
    }
    case "ORDER_CANCEL": {
      const o = s.orders.find((x) => x.id === p.id);
      if (!o) throw Error("Không tìm thấy đơn.");
      if (o.status === "completed")
        throw Error(
          "Đơn đã thu tiền cần quy trình hoàn tiền riêng, không được xóa.",
        );
      if (o.status === "cancelled") return source;
      o.status = "cancelled";
      message = "Hủy đơn " + o.code + " · " + str(p.reason, "Lý do hủy");
      break;
    }
    case "STOCK_ADJUST": {
      if (p.direction !== "in" && p.direction !== "out")
        throw Error("Chọn nhập hoặc xuất kho.");
      const i = s.ingredients.find(
        (x) => x.id === p.id && x.venueId === p.venueId,
      );
      if (!i) throw Error("Không tìm thấy nguyên liệu.");
      const q = num(p.quantity, "Số lượng", 0.0001, 100000);
      const reason = str(p.reason, "Lý do");
      if (p.direction === "out" && i.stock < q)
        throw Error("Không đủ tồn kho để xuất.");
      i.stock =
        Math.round((i.stock + (p.direction === "out" ? -q : q)) * 10000) /
        10000;
      message =
        (p.direction === "out" ? "Xuất " : "Nhập ") +
        q +
        " " +
        i.unit +
        " " +
        i.name +
        " · " +
        reason;
      break;
    }
    case "PRODUCT_SAVE": {
      const product = s.products.find((x) => x.id === p.id);
      if (!product) throw Error("Không tìm thấy món.");
      product.name = str(p.name, "Tên món", 80);
      product.price = count(p.price, "Giá món", 1000, 10000000);
      if (p.bom !== undefined) {
        if (!Array.isArray(p.bom) || p.bom.length < 1 || p.bom.length > 30)
          throw Error("Cần ít nhất một nguyên liệu trong công thức.");
        const ids = new Set<string>();
        product.bom = p.bom.map((b) => {
          const id = str(b.ingredientId, "Nguyên liệu", 80);
          if (ids.has(id) || !s.ingredients.some((i) => i.id === id))
            throw Error("Nguyên liệu bị trùng hoặc không tồn tại.");
          ids.add(id);
          return {
            ingredientId: id,
            quantity: num(b.quantity, "Định lượng", 0.0001, 100),
          };
        });
      }
      message = "Cập nhật món " + product.name;
      break;
    }
    case "BOOKING_CREATE": {
      const id = str(p.id, "Mã đặt bàn", 80);
      if (s.bookings.some((b) => b.id === id)) return source;
      const table = s.tables.find(
        (x) => x.id === p.tableId && x.venueId === p.venueId,
      );
      if (!table) throw Error("Bàn không hợp lệ.");
      const guests = count(p.guests, "Số khách", 1, 20);
      if (guests > table.seats) throw Error("Số khách vượt sức chứa của bàn.");
      const date = str(p.date, "Ngày", 10),
        time = str(p.time, "Giờ", 5);
      if (
        !validDate(date) ||
        !validTime(time) ||
        time < "07:00" ||
        time > "21:00"
      )
        throw Error("Chọn ngày và giờ trong khung 07:00–21:00.");
      const start = Date.parse(date + "T" + time + ":00+07:00");
      if (
        !Number.isFinite(start) ||
        start < Date.now() - 60000 ||
        start > Date.now() + 60 * 86400000
      )
        throw Error("Chọn thời gian trong 60 ngày tới.");
      const duration = 120;
      if (!slotAvailable(s, table.id, date, time, duration))
        throw Error(
          "Bàn vừa có người đặt vào khung giờ này. Vui lòng chọn bàn khác.",
        );
      const phone = phoneValue(p.phone);
      const requestedItems = Array.isArray(p.items) ? p.items : [];
      if (requestedItems.length > 30) throw Error("Quá nhiều món.");
      if (
        requestedItems.length &&
        s.venues.find((v) => v.id === table.venueId)?.model !== "cafe"
      )
        throw Error("Gọi món trước hiện dành cho chi nhánh café.");
      const items = requestedItems.map((x) => {
        const product = s.products.find((k) => k.id === x.productId);
        if (!product) throw Error("Món không hợp lệ.");
        return {
          productId: x.productId,
          quantity: count(x.quantity, "Số lượng"),
          price: product.price,
          name: product.name,
        };
      });
      const total = items.reduce(
        (sum, x) =>
          sum +
          s.products.find((k) => k.id === x.productId)!.price * x.quantity,
        0,
      );
      s.bookings.unshift({
        id,
        venueId: table.venueId,
        tableId: table.id,
        name: str(p.name, "Tên khách", 80),
        phone,
        guests,
        date,
        time,
        duration,
        need: str(p.need || "Gặp gỡ", "Nhu cầu", 80),
        note: typeof p.note === "string" ? p.note.slice(0, 300) : "",
        status: "pending",
        createdAt: new Date().toISOString(),
        items,
        total,
      });
      message = "Nhận yêu cầu đặt bàn " + table.name;
      break;
    }
    case "BOOKING_STATUS": {
      const b = s.bookings.find((x) => x.id === p.id);
      if (!b) throw Error("Không tìm thấy đặt bàn.");
      if (!["confirmed", "arrived", "cancelled"].includes(String(p.status)))
        throw Error("Trạng thái không hợp lệ.");
      if (b.status === "cancelled") throw Error("Yêu cầu đã hủy.");
      if (b.status === p.status) return source;
      if (b.status === "arrived")
        throw Error("Khách đã đến; không thể đổi ngược trạng thái.");
      if (p.status === "arrived" && b.status !== "confirmed")
        throw Error("Cần xác nhận bàn trước khi đón khách.");
      if (
        p.status === "confirmed" &&
        !slotAvailable(s, b.tableId, b.date, b.time, b.duration, b.id)
      )
        throw Error("Bàn đã được giữ bởi yêu cầu khác.");
      b.status = p.status as Booking["status"];
      message = "Đổi trạng thái đặt bàn của " + b.name;
      break;
    }
    case "BOOKING_TO_ORDER": {
      const b = s.bookings.find((x) => x.id === p.id);
      if (!b) throw Error("Không tìm thấy đặt bàn.");
      if (b.orderId) return source;
      if (b.status !== "arrived")
        throw Error("Ghi nhận khách đến trước khi chuyển món sang đơn.");
      if (!b.items.length) throw Error("Lượt đặt này chưa có món đặt trước.");
      const items = b.items.map((item) => {
        const product = s.products.find((x) => x.id === item.productId);
        if (!product) throw Error("Không tìm thấy món đã đặt.");
        return {
          ...item,
          name: item.name || product.name,
          price: item.price ?? product.price,
          bom: structuredClone(product.bom),
        };
      });
      const id = "booking-" + b.id;
      s.orders.unshift({
        id,
        code: nextOrderCode(s),
        venueId: b.venueId,
        table: s.tables.find((t) => t.id === b.tableId)?.name || "Tại quán",
        customer: b.name,
        items,
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: "preparing",
        payment: "unpaid",
        createdAt: new Date().toISOString(),
      });
      b.orderId = id;
      message = "Chuyển món đặt trước sang đơn " + s.orders[0].code;
      break;
    }
    case "CUSTOMER_ADD": {
      const phone = phoneValue(p.phone);
      if (s.customers.some((x) => x.phone === phone))
        throw Error("Khách hàng đã tồn tại.");
      s.customers.push({
        id: str(p.id, "ID", 80),
        name: str(p.name, "Tên khách", 80),
        phone,
        visits: 0,
        spend: 0,
        lastVisit: dateVN(),
        marketingConsent: p.marketingConsent === true,
      });
      message = "Thêm khách hàng mới";
      break;
    }
    case "SHIFT_ADD": {
      const name = str(p.name, "Tên nhân viên", 80),
        start = str(p.start, "Giờ bắt đầu", 5),
        end = str(p.end, "Giờ kết thúc", 5),
        date = str(p.date, "Ngày", 10);
      if (!validTime(start) || !validTime(end) || start >= end)
        throw Error("Ca cần kết thúc sau giờ bắt đầu trong cùng ngày.");
      if (!s.venues.some((v) => v.id === p.venueId))
        throw Error("Chi nhánh không hợp lệ.");
      if (!validDate(date)) throw Error("Ngày không hợp lệ.");
      if (
        s.shifts.some(
          (x) =>
            x.name.toLowerCase() === name.toLowerCase() &&
            x.date === date &&
            start < x.end &&
            end > x.start,
        )
      )
        throw Error("Nhân viên đã có ca trùng giờ.");
      s.shifts.push({
        id: str(p.id, "ID", 80),
        name,
        role: str(p.role, "Vị trí", 80),
        venueId: String(p.venueId),
        date,
        start,
        end,
        status: "scheduled",
      });
      message = "Xếp ca cho " + name;
      break;
    }
    case "SHIFT_STATUS": {
      const sh = s.shifts.find((x) => x.id === p.id);
      if (!sh) throw Error("Không tìm thấy ca.");
      if (p.status !== "checked-in" && p.status !== "completed")
        throw Error("Trạng thái không hợp lệ.");
      if (sh.status === "completed") return source;
      if (p.status === "completed" && sh.status !== "checked-in")
        throw Error("Cần bắt đầu ca trước khi kết thúc.");
      sh.status = p.status;
      message = "Cập nhật ca của " + sh.name;
      break;
    }
    case "ALERT_RESOLVE": {
      const id = str(p.id, "Mã cảnh báo", 100);
      if (!s.resolvedAlerts.includes(id)) s.resolvedAlerts.push(id);
      message = "Đánh dấu đã xem cảnh báo " + id;
      break;
    }
    case "SETTINGS_SAVE": {
      if (role !== "owner")
        throw Error("Chỉ chủ doanh nghiệp được đổi thông tin.");
      s.businessName = str(p.businessName, "Tên doanh nghiệp", 80);
      message = "Cập nhật thông tin doanh nghiệp";
      break;
    }
    case "VENUE_SAVE": {
      if (role !== "owner")
        throw Error("Chỉ chủ doanh nghiệp được đổi thông tin chi nhánh.");
      const v = s.venues.find((v) => v.id === p.id);
      if (!v) throw Error("Không tìm thấy chi nhánh.");
      v.name = str(p.name, "Tên chi nhánh", 80);
      v.area = str(p.area, "Địa chỉ", 160);
      message = "Cập nhật chi nhánh " + v.name;
      break;
    }
    default:
      throw Error("Thao tác không được hỗ trợ.");
  }
  s.audit.unshift({
    id: newId(),
    at: new Date().toISOString(),
    actor,
    message,
  });
  s.audit = s.audit.slice(0, 500);
  return s;
}
export function getAlerts(s: State, venueId = "all") {
  return s.ingredients
    .filter(
      (i) => (venueId === "all" || i.venueId === venueId) && i.stock < i.min,
    )
    .map((i) => ({
      id: "low-" + i.venueId + "-" + i.id,
      title: i.name + " dưới mức tối thiểu",
      detail:
        "Còn " + i.stock + " " + i.unit + " · Ngưỡng " + i.min + " " + i.unit,
      venueId: i.venueId,
      kind: "stock" as const,
    }));
}
export function safeExportCSV(rows: (string | number)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((r) =>
        r
          .map(
            (v) =>
              '"' +
              String(v)
                .replace(/^\s*[=+@\-]|^[\t\r\n]/, "'$&")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n")
  );
}
