// ========================================
// 1. LẤY CÁC PHẦN TỬ HTML
// ========================================

const seatMap = document.getElementById("seat-map");
const seatDetail = document.getElementById("seat-detail");
const floorTitle = document.getElementById("floor-title");
const floorSummary = document.getElementById("floor-summary");

const floorButtons = document.querySelectorAll(".floor-btn");
const seatTemplate = document.getElementById("seat-card-template");

// Danh sách bàn và phòng đọc từ JSON
let seats = [];

// Tầng hiện tại
let currentFloor = 1;

// ========================================
// 2. CẤU HÌNH TRẠNG THÁI
// ========================================

const statusLabels = {
  available: "Đang trống",
  waiting: "Chờ check-in",
  occupied: "Đang sử dụng",
};

// ========================================
// 3. ĐỌC DỮ LIỆU JSON
// ========================================

async function loadSeats() {
  try {
    const response = await fetch("data/seats.json");

    if (!response.ok) {
      throw new Error("Không thể tải seats.json");
    }

    seats = await response.json();

    // Hiển thị tầng 1 khi mở trang
    renderFloor(1);
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);

    seatMap.textContent =
      "Không thể tải dữ liệu bàn. Hãy kiểm tra seats.json và Live Server.";
  }
}

// ========================================
// 4. TẠO THẺ BÀN / PHÒNG
// ========================================

function createSeatCard(seat) {
  // Sao chép template HTML
  const card = seatTemplate.content.firstElementChild.cloneNode(true);

  // Thêm thông tin
  card.querySelector(".seat-name").textContent = seat.seatName;

  card.querySelector(".seat-capacity").textContent =
    `Sức chứa: ${seat.capacity} người`;

  card.querySelector(".seat-status").textContent =
    statusLabels[seat.status] || "Chưa xác định";

  // Thêm class trạng thái
  card.classList.add(seat.status);

  // Thêm class theo loại vị trí
  if (seat.type === "meetingRoom") {
    card.classList.add("meeting-room");
  }

  if (seat.type === "largeTable") {
    card.classList.add("large-table");
  }

  // Khi nhấn vào bàn/phòng
  card.addEventListener("click", () => {
    showSeatDetail(seat);
  });

  // ID động để JS tìm đúng ô bàn: table-DOM-B01, table-DOM-B02...
  card.id = `table-DOM-${seat.seatID}`;

  // Giữ nguyên giao diện khi render lại (chuyển tầng)
  if (seat.status !== "available") {
    card.classList.add("seat-disabled");
  }

  if (seat.customerName) {
    appendCustomerName(card, seat.customerName);
  }

  return card;
}

// ========================================
// 5. HIỂN THỊ THÔNG TIN BÀN / PHÒNG
// ========================================

function showSeatDetail(seat) {
  seatDetail.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Thông tin chỗ ngồi";

  const id = document.createElement("p");
  id.textContent = `Mã: ${seat.seatID}`;

  const name = document.createElement("p");
  name.textContent = `Tên: ${seat.seatName}`;

  const floor = document.createElement("p");
  floor.textContent = `Tầng: ${seat.floor}`;

  const type = document.createElement("p");

  const typeLabels = {
    individual: "Bàn cá nhân",
    largeTable: "Bàn lớn",
    meetingRoom: "Phòng họp",
  };

  type.textContent = `Loại: ${typeLabels[seat.type] || seat.type}`;

  const capacity = document.createElement("p");
  capacity.textContent = `Sức chứa: ${seat.capacity} người`;

  const status = document.createElement("p");
  status.textContent = `Trạng thái: ${statusLabels[seat.status] || "Chưa xác định"}`;

  seatDetail.append(title, id, name, floor, type, capacity, status);
}

// ========================================
// 6. HIỂN THỊ TẦNG 1
// ========================================

function renderFloorOne() {
  seatMap.innerHTML = `
        <div class="floor-one-map">

            <div class="seat-column left-column"></div>

            <div class="center-seat"></div>

            <div class="seat-column right-column"></div>

        </div>
    `;

  const leftColumn = seatMap.querySelector(".left-column");
  const rightColumn = seatMap.querySelector(".right-column");
  const centerSeat = seatMap.querySelector(".center-seat");

  // Lấy danh sách bàn tầng 1
  const floorSeats = seats.filter((seat) => seat.floor === 1);

  floorSeats.forEach((seat) => {
    const card = createSeatCard(seat);

    if (seat.position.area === "left") {
      leftColumn.appendChild(card);
    } else if (seat.position.area === "right") {
      rightColumn.appendChild(card);
    } else if (seat.position.area === "center") {
      centerSeat.appendChild(card);
    }
  });
}

// ========================================
// 7. HIỂN THỊ TẦNG 2
// ========================================

function renderFloorTwo() {
  seatMap.innerHTML = `
        <div class="floor-two-map">
            <div class="meeting-room-list"></div>
        </div>
    `;

  const meetingRoomList = seatMap.querySelector(".meeting-room-list");

  // Lấy danh sách phòng họp tầng 2
  const meetingRooms = seats.filter((seat) => seat.floor === 2);

  meetingRooms.forEach((seat) => {
    const card = createSeatCard(seat);

    meetingRoomList.appendChild(card);
  });
}

// ========================================
// 8. CHUYỂN TẦNG
// ========================================

function renderFloor(floor) {
  currentFloor = floor;

  // Cập nhật tiêu đề
  floorTitle.textContent = `Sơ đồ tầng ${floor}`;

  // Cập nhật mô tả
  const floorSeats = seats.filter((seat) => seat.floor === floor);

  floorSummary.textContent = `Có ${floorSeats.length} bàn/phòng`;

  // Hiển thị sơ đồ tương ứng
  if (floor === 1) {
    renderFloorOne();
  } else if (floor === 2) {
    renderFloorTwo();
  }

  // Đưa bảng thông tin về trạng thái ban đầu
  seatDetail.innerHTML = `
        <div class="detail-empty">
            <h3>Thông tin bàn</h3>
            <p>Vui lòng chọn một bàn để xem thông tin.</p>
        </div>
    `;

  // Cập nhật nút tầng đang chọn
  floorButtons.forEach((button) => {
    const selectedFloor = Number(button.dataset.floor);

    button.classList.toggle("active", selectedFloor === floor);
  });
}

// ========================================
// 9. SỰ KIỆN NHẤN NÚT CHUYỂN TẦNG
// ========================================

floorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const floor = Number(button.dataset.floor);

    renderFloor(floor);
  });
});

// ========================================
// 10. KHỞI CHẠY
// ========================================

loadSeats();

// ========================================
// 11. MODAL ĐẶT BÀN
// ========================================

const bookingModal = document.getElementById("booking-modal");
const bookingForm = document.getElementById("booking-form");
const selectedTableIdInput = document.getElementById("selectedTableId");
const selectedTableNameEl = document.getElementById("selectedTableName");
const packageSelect = document.getElementById("packageSelect");
const drinkSelect = document.getElementById("drinkSelect");
const totalPriceEl = document.getElementById("totalPrice");

function formatMoney(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Chỉ hiện các gói phù hợp với loại bàn (cá nhân / bàn lớn / phòng họp).
// Chỉ khách cá nhân mới được chọn nước pha sẵn (+10k);
// nhóm và phòng họp đã kèm nước nên khóa ô chọn nước.
function filterPackagesByType(seatType) {
  Array.from(packageSelect.options).forEach((option) => {
    const optionType = option.dataset.type;
    const visible = !optionType || !seatType || optionType === seatType;

    option.hidden = !visible;
    option.disabled = !visible;
  });

  const drinkNote = document.getElementById("drinkNote");
  const drinkIncluded = Boolean(seatType) && seatType !== "individual";

  drinkSelect.disabled = drinkIncluded;
  drinkNote.style.display = drinkIncluded ? "block" : "none";
  drinkNote.textContent =
    seatType === "meetingRoom"
      ? "Đã kèm nước suối, không cộng thêm."
      : "Đã kèm 1 nước trong menu, không cộng thêm.";
}

// Mở modal đặt bàn
function openModal(tableId, tableName, seatType) {
  bookingForm.reset();

  selectedTableIdInput.value = tableId;
  selectedTableNameEl.textContent = tableName;

  filterPackagesByType(seatType);
  calculateTotal();

  bookingModal.style.display = "flex";
}

// Đóng modal
function closeModal() {
  bookingModal.style.display = "none";
}

// Nhấn ra vùng đen bên ngoài modal -> đóng
bookingModal.addEventListener("click", (event) => {
  if (event.target === bookingModal) {
    closeModal();
  }
});

// Nhấn phím Esc -> đóng
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && bookingModal.style.display === "flex") {
    closeModal();
  }
});

// Tính tổng tiền = giá gói giờ + tiền nước
function calculateTotal() {
  const packagePrice = Number(packageSelect.value) || 0;
  const drinkPrice = Number(drinkSelect.value) || 0;

  totalPriceEl.textContent = formatMoney(packagePrice + drinkPrice);
}

// Xử lý khi gửi form đặt bàn
function handleBookingSubmit(event) {
  // Chặn reload trang
  event.preventDefault();

  const bookingData = {
    tableId: selectedTableIdInput.value,
    customerName: document.getElementById("customerName").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
    expectedTime: document.getElementById("expectedTime").value,
    packagePrice: Number(packageSelect.value),
    drinkAddonPrice: Number(drinkSelect.value),
  };

  console.log("Dữ liệu đặt bàn:", bookingData);

  // Đổi ô bàn sang màu Cam ngay lập tức
  markSeatAsWaiting(bookingData.tableId, bookingData.customerName);

  alert("Đặt bàn thành công!");

  closeModal();
}

seatMap.addEventListener("click", (event) => {
  const card = event.target.closest(".seat-card.available");

  if (!card) return;

  const seatName = card.querySelector(".seat-name").textContent;
  const seat = seats.find((item) => item.seatName === seatName);

  if (!seat) return;

  openModal(seat.seatID, seat.seatName, seat.type);
});

// ========================================
// 12. ĐỔI TRẠNG THÁI Ô BÀN SAU KHI ĐẶT
// ========================================

function appendCustomerName(card, customerName) {
  const small = document.createElement("small");
  small.className = "seat-customer";
  small.textContent = `Khách: ${customerName}`; // textContent: an toàn, không chèn HTML
  card.appendChild(small);
}

function markSeatAsWaiting(tableId, customerName) {
  const seat = seats.find((item) => item.seatID === tableId);

  if (seat) {
    seat.status = "waiting";
    seat.customerName = customerName;
  }

  const card = document.getElementById(`table-DOM-${tableId}`);

  if (!card) return;

  card.classList.remove("available");
  card.classList.add("waiting", "seat-disabled");

  card.querySelector(".seat-status").textContent = statusLabels.waiting;

  appendCustomerName(card, customerName);

  if (seat) showSeatDetail(seat);
}
