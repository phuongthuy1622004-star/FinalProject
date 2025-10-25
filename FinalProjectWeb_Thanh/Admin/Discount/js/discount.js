// Khi toàn bộ nội dung trang đã được tải xong
document.addEventListener("DOMContentLoaded", () => {

  // Lấy các phần tử trong form khuyến mãi
  const nameInput = document.getElementById("discount-name"); // Tên khuyến mãi
  const descriptionInput = document.getElementById("discount-description"); // Mô tả
  const startInput = document.getElementById("start-time"); // Thời gian bắt đầu
  const endInput = document.getElementById("end-time"); // Thời gian kết thúc
  const hasEndCheckbox = document.getElementById("has-end-time"); // Checkbox "có thời gian kết thúc"
  const typeSelect = document.getElementById("discount-type"); // Loại khuyến mãi
  const scopeSelect = document.getElementById("discount-scope"); // Phạm vi áp dụng
  const valueInput = document.getElementById("discount-value"); // Giá trị giảm
  const unitSelect = document.getElementById("discount-unit"); // Đơn vị (% hoặc ₫)
  const limitInput = document.getElementById("discount-limit"); // Giới hạn giá trị
  const valueSuffix = document.getElementById("value-suffix"); // Ký hiệu đơn vị hiển thị bên cạnh giá trị

  // Các phần tử hiển thị tóm tắt bên phải
  const summary = {
    title: document.getElementById("summary-title"),          // Tiêu đề
    description: document.getElementById("summary-description"), // Mô tả
    type: document.getElementById("summary-type"),            // Loại khuyến mãi
    scope: document.getElementById("summary-scope"),          // Phạm vi áp dụng
    value: document.getElementById("summary-value"),          // Giá trị giảm
    limit: document.getElementById("summary-limit"),          // Giới hạn giảm
    time: document.getElementById("summary-time"),            // Thời gian hiệu lực
  };

  // Hàm định dạng số (có thể là tiền tệ hoặc phần trăm)
  const formatNumber = (value, isPercent = false) => {
    if (value === "" || value === null || Number.isNaN(Number(value))) {
      return isPercent ? "0%" : "0 ₫"; // Nếu chưa nhập gì thì hiển thị mặc định
    }
    const numeric = Number(value);
    if (isPercent) {
      return `${numeric.toLocaleString("vi-VN")} %`;
    }
    return `${numeric.toLocaleString("vi-VN")} ₫`;
  };

  // Hàm định dạng ngày giờ theo chuẩn Việt Nam
  const formatDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm cập nhật phần tóm tắt bên phải theo dữ liệu người dùng nhập
  const updateSummary = () => {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const typeText = typeSelect.options[typeSelect.selectedIndex]?.text || "";
    const scopeText = scopeSelect.options[scopeSelect.selectedIndex]?.text || "";
    const unit = unitSelect.value;
    const value = valueInput.value;
    const limitValue = limitInput.value;

    // Cập nhật tiêu đề và mô tả
    summary.title.textContent = name || "Chưa đặt tên";
    summary.description.textContent = description || "Nhập mô tả để hiển thị tại đây.";
    summary.type.textContent = typeText;
    summary.scope.textContent = `Áp dụng cho ${scopeText.toLowerCase()}`;

    // Cập nhật giá trị giảm
    const valueLabel = unit === "percent" ? formatNumber(value, true) : formatNumber(value);
    summary.value.textContent = `Giảm ${valueLabel}`;

    // Cập nhật giới hạn nếu có
    if (limitValue) {
      const numericLimit = Number(limitValue);
      const limitLabel =
        unit === "percent"
          ? `${numericLimit.toLocaleString("vi-VN")} %`
          : `${numericLimit.toLocaleString("vi-VN")} ₫`;
      summary.limit.textContent = `Giới hạn tối đa ${limitLabel}`;
    } else {
      summary.limit.textContent = "Không giới hạn giá trị";
    }

    // Cập nhật thời gian hiệu lực
    const start = formatDateTime(startInput.value);
    const end = hasEndCheckbox.checked ? formatDateTime(endInput.value) : null;

    if (start && end) {
      summary.time.textContent = `Hiệu lực từ ${start} - ${end}`;
    } else if (start && !hasEndCheckbox.checked) {
      summary.time.textContent = `Hiệu lực từ ${start} (không có thời gian kết thúc)`;
    } else if (start) {
      summary.time.textContent = `Bắt đầu từ ${start}`;
    } else {
      summary.time.textContent = "Chưa đặt thời gian";
    }
  };

  // Hàm đồng bộ đơn vị hiển thị ₫ hoặc %
  const syncSuffix = () => {
    const unit = unitSelect.value;
    valueSuffix.textContent = unit === "percent" ? "%" : "₫";
    updateSummary();
  };

  // Khi tick hoặc bỏ tick "có thời gian kết thúc"
  hasEndCheckbox.addEventListener("change", () => {
    const enabled = hasEndCheckbox.checked;
    endInput.disabled = !enabled;
    if (!enabled) {
      endInput.value = "";
      endInput.setAttribute("aria-disabled", "true");
    } else {
      endInput.removeAttribute("aria-disabled");
    }
    updateSummary();
  });

  // Khi người dùng nhập tên hoặc mô tả
  [nameInput, descriptionInput].forEach((node) => {
    node.addEventListener("input", updateSummary);
  });

  // Khi người dùng thay đổi các giá trị khác
  [startInput, endInput, typeSelect, scopeSelect, valueInput, limitInput].forEach((node) => {
    node.addEventListener("input", updateSummary);
    node.addEventListener("change", updateSummary);
  });

  // Khi người dùng đổi đơn vị (% hoặc ₫)
  unitSelect.addEventListener("change", syncSuffix);

  // Gọi một lần khi trang vừa tải để hiển thị giá trị mặc định
  syncSuffix();
});
