import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyAction,
  dayOffset,
  initialState,
  safeExportCSV,
  slotAvailable,
  type Action,
  type State,
} from "../src/domain.ts";

const order = (id = "test-order", quantity = 2): Action => ({
  type: "ORDER_CREATE",
  payload: {
    id,
    venueId: "v1",
    table: "B01",
    items: [{ productId: "p1", quantity, price: 1 }],
  },
});
const booking = (id = "test-booking", time = "10:00"): Action => ({
  type: "BOOKING_CREATE",
  payload: {
    id,
    venueId: "v1",
    tableId: "v1-t1",
    date: dayOffset(1),
    time,
    guests: 2,
    name: "Khách kiểm thử",
    phone: "0900000099",
    items: [{ productId: "p1", quantity: 2, price: 1 }],
  },
});
const stock = (s: State) =>
  s.ingredients.find((i) => i.id === "i1" && i.venueId === "v1")!.stock;

test("Giá trên máy chủ và mã đơn là duy nhất, không lấy giá từ giỏ khách", () => {
  const s = initialState();
  const next = applyAction(s, order());
  assert.equal(next.orders[0].total, 90000);
  assert.equal(
    new Set(next.orders.map((o) => o.code)).size,
    next.orders.length,
  );
  assert.equal(
    s.orders.some((o) => o.id === "test-order"),
    false,
  );
});
test("Thu tiền trừ công thức một lần; gửi lại không trừ kho lần hai", () => {
  const created = applyAction(initialState(), order());
  const settled = applyAction(created, {
    type: "ORDER_SETTLE",
    payload: { id: "test-order" },
  });
  assert.equal(stock(settled), stock(created) - 0.04);
  assert.equal(settled.orders[0].payment, "cash");
  assert.equal(
    applyAction(settled, {
      type: "ORDER_SETTLE",
      payload: { id: "test-order" },
    }),
    settled,
  );
  assert.throws(
    () =>
      applyAction(settled, {
        type: "ORDER_CANCEL",
        payload: { id: "test-order", reason: "Thử hủy" },
      }),
    /hoàn tiền/,
  );
});
test("Tổng định lượng nhiều dòng không được làm âm kho; lỗi không làm thay đổi nguồn", () => {
  const base = initialState();
  base.ingredients.find((i) => i.id === "i1" && i.venueId === "v1")!.stock =
    0.03;
  const created = applyAction(base, {
    type: "ORDER_CREATE",
    payload: {
      id: "short-stock",
      venueId: "v1",
      items: [
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 1 },
      ],
    },
  });
  assert.throws(
    () =>
      applyAction(created, {
        type: "ORDER_SETTLE",
        payload: { id: "short-stock" },
      }),
    /Không đủ tồn kho/,
  );
  assert.equal(stock(created), 0.03);
  assert.equal(created.orders[0].status, "preparing");
});
test("Thay đổi công thức không sửa ngược định lượng của đơn đã tạo", () => {
  const created = applyAction(initialState(), order("snapshot", 1));
  const changed = applyAction(created, {
    type: "PRODUCT_SAVE",
    payload: {
      id: "p1",
      name: "Cà phê mới",
      price: 60000,
      bom: [{ ingredientId: "i1", quantity: 0.1 }],
    },
  });
  const settled = applyAction(changed, {
    type: "ORDER_SETTLE",
    payload: { id: "snapshot" },
  });
  assert.equal(settled.orders[0].total, 45000);
  assert.equal(stock(settled), 2.38);
});
test("Nhân viên không được sửa kho/giá; quản lý không đổi thông tin chủ doanh nghiệp", () => {
  const s = initialState();
  assert.throws(
    () =>
      applyAction(
        s,
        {
          type: "STOCK_ADJUST",
          payload: {
            id: "i1",
            venueId: "v1",
            direction: "in",
            quantity: 1,
            reason: "Nhập",
          },
        },
        "Nhân viên",
        "staff",
      ),
    /không có quyền/,
  );
  assert.throws(
    () =>
      applyAction(
        s,
        {
          type: "PRODUCT_SAVE",
          payload: { id: "p1", name: "Đổi", price: 1000 },
        },
        "Nhân viên",
        "staff",
      ),
    /không có quyền/,
  );
  assert.throws(
    () =>
      applyAction(
        s,
        { type: "SETTINGS_SAVE", payload: { businessName: "Đổi" } },
        "Quản lý",
        "manager",
      ),
    /Chỉ chủ/,
  );
});
test("Khung đặt bàn chồng nhau bị chặn; khung liền kề và giữ tạm hết hạn được giải phóng", () => {
  const s = applyAction(initialState(), booking());
  assert.equal(slotAvailable(s, "v1-t1", dayOffset(1), "11:00"), false);
  assert.equal(slotAvailable(s, "v1-t1", dayOffset(1), "12:00"), true);
  assert.throws(() => applyAction(s, booking("overlap", "11:30")), /Bàn vừa/);
  s.bookings[0].createdAt = new Date(Date.now() - 31 * 60000).toISOString();
  assert.equal(slotAvailable(s, "v1-t1", dayOffset(1), "10:00"), true);
});
test("Không nhận ngày/giờ sai, vượt chỗ ngồi, hoặc món đặt trước ở buffet", () => {
  const s = initialState();
  for (const extra of [
    { time: "10:70" },
    { date: "2027-02-30" },
    { guests: 3 },
    { venueId: "v3", tableId: "v3-t1" },
  ]) {
    const a = booking();
    a.payload = { ...a.payload, ...extra };
    assert.throws(() => applyAction(s, a));
  }
  assert.equal(slotAvailable(s, "v1-t1", "2027-02-30", "10:00"), false);
});
test("Món đặt trước giữ giá tại lúc đặt và chỉ chuyển thành đơn một lần", () => {
  let s = applyAction(initialState(), booking());
  assert.throws(
    () =>
      applyAction(s, {
        type: "BOOKING_STATUS",
        payload: { id: "test-booking", status: "arrived" },
      }),
    /xác nhận/,
  );
  s = applyAction(s, {
    type: "PRODUCT_SAVE",
    payload: { id: "p1", name: "Tên mới", price: 100000 },
  });
  s = applyAction(s, {
    type: "BOOKING_STATUS",
    payload: { id: "test-booking", status: "confirmed" },
  });
  s = applyAction(s, {
    type: "BOOKING_STATUS",
    payload: { id: "test-booking", status: "arrived" },
  });
  const before = stock(s);
  s = applyAction(s, {
    type: "BOOKING_TO_ORDER",
    payload: { id: "test-booking" },
  });
  assert.equal(s.orders[0].total, 90000);
  assert.equal(s.orders[0].payment, "unpaid");
  assert.equal(stock(s), before);
  assert.equal(
    applyAction(s, {
      type: "BOOKING_TO_ORDER",
      payload: { id: "test-booking" },
    }),
    s,
  );
});
test("Nhập kho cần chiều hợp lệ; ca làm không chồng lấn ở hai chi nhánh", () => {
  const s = initialState();
  assert.throws(
    () =>
      applyAction(s, {
        type: "STOCK_ADJUST",
        payload: {
          id: "i1",
          venueId: "v1",
          direction: "wrong",
          quantity: 1,
          reason: "Nhập",
        },
      }),
    /Chọn nhập/,
  );
  let next = applyAction(s, {
    type: "SHIFT_ADD",
    payload: {
      id: "shift1",
      name: "Người thử",
      role: "Thu ngân",
      venueId: "v1",
      date: dayOffset(1),
      start: "08:00",
      end: "16:00",
    },
  });
  assert.throws(
    () =>
      applyAction(next, {
        type: "SHIFT_ADD",
        payload: {
          id: "shift2",
          name: "Người thử",
          role: "Thu ngân",
          venueId: "v2",
          date: dayOffset(1),
          start: "15:00",
          end: "22:00",
        },
      }),
    /trùng giờ/,
  );
});
test("CSV có tiếng Việt và vô hiệu hóa ô công thức", () => {
  const csv = safeExportCSV([
    ["Tên", "=1+1", " @SUM(A1)", "\t=1+1", 'Nguyễn "An"'],
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=1+1"'));
  assert.ok(csv.includes('"\' @SUM(A1)"'));
  assert.ok(csv.includes('Nguyễn ""An""'));
});
