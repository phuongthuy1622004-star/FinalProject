// ========================== BIẾN TOÀN CỤC ==========================
let allCustomers = [];  // Danh sách tất cả khách hàng

// ========================== TẢI DỮ LIỆU TỪ JSON ==========================
fetch("../data/cus.json")
  .then(response => {
    // Kiểm tra nếu không tải được dữ liệu
    if (!response.ok) throw new Error('Không thể tải dữ liệu khách hàng');
    return response.json();
  })
  .then(data => {
    // Lưu danh sách khách hàng vào biến toàn cục
    allCustomers = data.customers || [];
    const select = document.getElementById("customerSelect");
    
    // Thêm tất cả khách hàng vào dropdown
    allCustomers.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.name;
      select.appendChild(option);
    });

    // Sự kiện khi chọn khách hàng từ dropdown
    select.addEventListener("change", () => {
      const customer = allCustomers.find(c => c.id === select.value);
      if (customer) {
        // Hiển thị thông tin khách hàng đã chọn
        displayCustomer(customer);
        // Lưu ID vào localStorage để giữ trạng thái
        localStorage.setItem("selectedCustomerId", customer.id);
      }
    });

    // ========== TỰ ĐỘNG LOAD KHÁCH HÀNG TỪ LOCALSTORAGE ==========
    // Lấy ID khách hàng từ localStorage (được truyền từ customer-list.html)
    const savedCustomerId = localStorage.getItem("selectedCustomerId");
    if (savedCustomerId) {
      // Tìm khách hàng theo ID
      const customer = allCustomers.find(c => c.id === savedCustomerId);
      if (customer) {
        // Set giá trị cho dropdown
        select.value = savedCustomerId;
        // Hiển thị thông tin khách hàng
        displayCustomer(customer);
      } else {
        // Nếu không tìm thấy khách hàng, hiển thị thông báo
        showError("Không tìm thấy khách hàng với ID: " + savedCustomerId);
      }
    }

    // Ẩn loading khi đã tải xong
    document.getElementById("loadingMessage").style.display = "none";
  })
  .catch(error => {
    // Xử lý lỗi khi không tải được dữ liệu
    console.error('Lỗi:', error);
    document.getElementById("loadingMessage").style.display = "none";
    showError("Không thể tải dữ liệu. Vui lòng kiểm tra file ../data/cus.json");
  });

// ========================== HIỂN THỊ THÔNG TIN KHÁCH HÀNG ==========================
function displayCustomer(c) {
  // Hiển thị phần thông tin khách hàng
  document.getElementById("customerInfo").style.display = "block";
  document.getElementById("errorMessage").style.display = "none";

  // ========== AVATAR: Lấy chữ cái đầu của tên ==========
  const initials = c.name.split(" ")
    .map(w => w[0])              // Lấy ký tự đầu mỗi từ
    .join("")                     // Ghép lại
    .slice(0, 2)                  // Chỉ lấy 2 ký tự đầu
    .toUpperCase();               // Viết hoa
  document.getElementById("avatar").textContent = initials;
  
  // ========== TÊN KHÁCH HÀNG ==========
  document.getElementById("name").textContent = c.name;
  
  // ========== EMAIL ==========
  const emailEl = document.getElementById("email");
  emailEl.textContent = c.email || "---";
  if (c.email) {
    emailEl.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}`;
    emailEl.target = "_blank"; // mở tab Gmail mới
  }

  // ========== SỐ ĐIỆN THOẠI ==========
  document.getElementById("phone").textContent = c.phone || "---";
  
  // ========== ĐỊA CHỈ ==========
  document.getElementById("address").textContent = c.address || "---";

  // ========== ĐỒNG Ý NHẬN QUẢNG CÁO ==========
  document.getElementById("marketingStatus").textContent =
    c.acceptsMarketing ? "✔ Đồng ý nhận tin quảng cáo" : "❌ Không nhận tin quảng cáo";

  // ========== TỔNG ĐƠN VÀ CHI TIÊU ==========
  document.getElementById("totalOrders").textContent = c.totalOrders + " đơn";
  document.getElementById("totalSpent").textContent = 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.totalSpent);

  // ========== ĐƠN HÀNG GẦN ĐÂY ==========
  if (c.lastOrder && c.lastOrder.orderId) {
    // Định dạng ngày tháng
    const orderDate = new Date(c.lastOrder.date).toLocaleDateString('vi-VN');
    document.getElementById("lastOrder").textContent =
      `${c.lastOrder.orderId} - ${orderDate}`;
  } else {
    document.getElementById("lastOrder").textContent = "Không có đơn hàng gần đây";
  }

  // ========== TÌNH TRẠNG MUA HÀNG ==========
  document.getElementById("purchaseStatus").textContent =
    c.totalOrders > 0 ? "✅ Khách đã mua hàng" : "⏳ Chưa có đơn hàng";

  // ========== TÍNH SỐ NGÀY GẮN BÓ ==========
  if (c.registerDate) {
    const registerDate = new Date(c.registerDate);
    const today = new Date();
    // Tính số ngày chênh lệch
    const diff = Math.floor((today - registerDate) / (1000 * 60 * 60 * 24));
    document.getElementById("daysActive").textContent = diff + " ngày";
  } else {
    document.getElementById("daysActive").textContent = "Không rõ";
  }

  // ========== ĐÁNH GIÁ SAO ==========
  // Giả sử có field rating từ 0-5 trong dữ liệu
  const ratingStars = document.getElementById("ratingStars").children;
  const rating = c.rating || 0;
  // Đánh dấu số sao tương ứng với rating
  for (let i = 0; i < ratingStars.length; i++) {
    ratingStars[i].classList.toggle("active", i < rating);
  }

  // ========== FEEDBACK/BÌNH LUẬN ==========
  document.getElementById("feedback").textContent = c.feedback || "Chưa có bình luận";
}

// ========================== HIỂN THỊ THÔNG BÁO LỖI ==========================
function showError(message) {
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorMessage").style.display = "block";
  document.getElementById("customerInfo").style.display = "none";
}