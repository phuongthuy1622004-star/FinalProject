// ========================== BIẾN TOÀN CỤC ==========================
let allCustomers = [];

// ========================== GENERATE SAMPLE DATA ==========================
const generateSampleData = () => {
    const names = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Châu', 'Phạm Hoàng Dũng',
        'Võ Thị Lan', 'Đặng Quốc Huy', 'Bùi Thị Mai', 'Hoàng Văn Nam',
        'Dương Thị Oanh', 'Ngô Văn Phúc', 'Đỗ Thị Quỳnh', 'Lý Văn Sang',
        'Trương Thị Thảo', 'Phan Văn Uyên', 'Mai Thị Vân'
    ];
    
    const districts = [
        'Quận 1', 'Quận 3', 'Quận Bình Thạnh', 'Quận 10',
        'Quận Tân Bình', 'Quận Phú Nhuận', 'Quận Gò Vấp'
    ];
    
    return names.map((name, i) => ({
        id: `CUS${String(i + 1).padStart(5, '0')}`,
        name: name,
        phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '')}@gmail.com`,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Cách Mạng Tháng 8', 'Võ Văn Tần'][Math.floor(Math.random() * 5)]}, ${districts[Math.floor(Math.random() * districts.length)]}, Hồ Chí Minh`,
        lastOrder: i % 3 !== 0 ? {
            orderId: `#${10000 + Math.floor(Math.random() * 90000)}`,
            date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        } : null,
        totalOrders: Math.floor(Math.random() * 100) + 1,
        avgOrderValue: Math.floor(Math.random() * 5000000) + 500000,
        debt: Math.floor(Math.random() * 3000000),
        totalSpent: Math.floor(Math.random() * 50000000) + 1000000,
        lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        registerDate: new Date(Date.now() - Math.floor(Math.random() * 730) * 24 * 60 * 60 * 1000),
        acceptsMarketing: Math.random() > 0.3,
        rating: Math.floor(Math.random() * 5) + 1,
        feedback: i % 2 === 0 ? "Sản phẩm rất tốt, giao hàng nhanh!" : "Chất lượng ổn, sẽ ủng hộ tiếp!"
    }));
};

// ========================== TẢI DỮ LIỆU ==========================
async function loadData() {
    try {
        try {
            const res = await fetch('../data/cus.json');
            if (res.ok) {
                const data = await res.json();
                allCustomers = data.customers || [];
            } else {
                throw new Error('File not found');
            }
        } catch {
            allCustomers = generateSampleData();
        }
        
        const select = document.getElementById("customerSelect");
        
        allCustomers.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            const customer = allCustomers.find(c => c.id === select.value);
            if (customer) {
                displayCustomer(customer);
                localStorage.setItem("selectedCustomerId", customer.id);
            }
        });

        const savedCustomerId = localStorage.getItem("selectedCustomerId");
        if (savedCustomerId) {
            const customer = allCustomers.find(c => c.id === savedCustomerId);
            if (customer) {
                select.value = savedCustomerId;
                displayCustomer(customer);
            } else {
                showError("Không tìm thấy khách hàng với ID: " + savedCustomerId);
            }
        }

        document.getElementById("loadingMessage").style.display = "none";
    } catch (error) {
        console.error('Lỗi:', error);
        document.getElementById("loadingMessage").style.display = "none";
        showError("Không thể tải dữ liệu. Đang sử dụng dữ liệu mẫu.");
        
        allCustomers = generateSampleData();
        const select = document.getElementById("customerSelect");
        allCustomers.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = c.name;
            select.appendChild(option);
        });
    }
}

// ========================== HIỂN THỊ THÔNG TIN KHÁCH HÀNG ==========================
function displayCustomer(c) {
    document.getElementById("customerInfo").style.display = "block";
    document.getElementById("errorMessage").style.display = "none";

    const initials = c.name.split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    document.getElementById("avatar").textContent = initials;
    
    document.getElementById("name").textContent = c.name;
    
    const emailEl = document.getElementById("email");
    emailEl.textContent = c.email || "---";
    if (c.email) {
        emailEl.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}`;
    }

    document.getElementById("phone").textContent = c.phone || "---";
    document.getElementById("address").textContent = c.address || "---";

    document.getElementById("marketingStatus").textContent =
        c.acceptsMarketing ? "✔ Đồng ý nhận tin quảng cáo" : "❌ Không nhận tin quảng cáo";

    document.getElementById("totalOrders").textContent = c.totalOrders + " đơn";
    document.getElementById("totalSpent").textContent = 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.totalSpent);

    if (c.lastOrder && c.lastOrder.orderId) {
        const orderDate = new Date(c.lastOrder.date).toLocaleDateString('vi-VN');
        document.getElementById("lastOrder").textContent =
            `${c.lastOrder.orderId} - ${orderDate}`;
    } else {
        document.getElementById("lastOrder").textContent = "Không có đơn hàng gần đây";
    }

    document.getElementById("purchaseStatus").textContent =
        c.totalOrders > 0 ? "✅ Khách đã mua hàng" : "⏳ Chưa có đơn hàng";

    if (c.registerDate) {
        const registerDate = new Date(c.registerDate);
        const today = new Date();
        const diff = Math.floor((today - registerDate) / (1000 * 60 * 60 * 24));
        document.getElementById("daysActive").textContent = diff + " ngày";
    } else {
        document.getElementById("daysActive").textContent = "Không rõ";
    }

    const ratingStars = document.getElementById("ratingStars").children;
    const rating = c.rating || 0;
    for (let i = 0; i < ratingStars.length; i++) {
        ratingStars[i].classList.toggle("active", i < rating);
    }

    document.getElementById("feedback").textContent = c.feedback || "Chưa có bình luận";
}

// ========================== HIỂN THỊ LỖI ==========================
function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorMessage").style.display = "block";
}

// ========================== NÚT QUAY LẠI ==========================
function goBack() {
    window.history.back();
}

// ========================== KHỞI ĐỘNG ==========================
document.addEventListener('DOMContentLoaded', loadData);
