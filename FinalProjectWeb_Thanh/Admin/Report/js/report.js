// Khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  const chartCanvas = document.getElementById("report-chart");
  const tbody = document.getElementById("report-body");
  const reportRange = document.getElementById("report-range");
  const comparisonRange = document.getElementById("comparison-range");
  const legendLabel = document.getElementById("legend-label");
  const filterTags = document.getElementById("filter-tags");
  const changeHandlers = [reportRange, comparisonRange];

  // Bảng màu dùng cho biểu đồ
  const palette = {
    primary: "#FEB9A5",
    primaryDark: "#FF5D2D",
    accent: "#AA3001",
    primaryRgb: "254, 185, 165",
    primaryDarkRgb: "255, 93, 45",
    accentRgb: "170, 48, 1",
    mutedRgb: "191, 108, 86",
  };

  // Dữ liệu theo phạm vi báo cáo (đã Việt hoá nhãn)
  const datasetMap = {
    "this-month": {
      label: "01/10/2025 - 31/10/2025",
      data: [
        { date: "01/10/2025", orders: 16, revenue: 42500000, discount: 1250000, net: 41250000, shipping: 820000, shippingDiscount: 0, total: 42070000, paid: 42070000 },
        { date: "08/10/2025", orders: 25, revenue: 64800000, discount: 2150000, net: 62650000, shipping: 1340000, shippingDiscount: 200000, total: 62020000, paid: 62020000 },
        { date: "09/10/2025", orders: 33, revenue: 107763000, discount: 0, net: 107763000, shipping: 0, shippingDiscount: 0, total: 107763000, paid: 107763000 },
      ],
    },
    "last-month": {
      label: "01/09/2025 - 30/09/2025",
      data: [
        { date: "04/09/2025", orders: 12, revenue: 31500000, discount: 850000, net: 30650000, shipping: 650000, shippingDiscount: 0, total: 30000000, paid: 30000000 },
        { date: "16/09/2025", orders: 19, revenue: 48700000, discount: 1200000, net: 47500000, shipping: 910000, shippingDiscount: 100000, total: 46790000, paid: 46790000 },
        { date: "27/09/2025", orders: 28, revenue: 78000000, discount: 0, net: 78000000, shipping: 0, shippingDiscount: 0, total: 78000000, paid: 78000000 },
      ],
    },
    "this-quarter": {
      label: "Quý 4 năm 2025",
      data: [
        { date: "Tháng 10", orders: 74, revenue: 205463000, discount: 3400000, net: 202063000, shipping: 2160000, shippingDiscount: 200000, total: 200003000, paid: 200003000 },
        { date: "Tháng 11", orders: 82, revenue: 228710000, discount: 2800000, net: 225910000, shipping: 1750000, shippingDiscount: 320000, total: 224840000, paid: 224840000 },
        { date: "Tháng 12", orders: 95, revenue: 268900000, discount: 4200000, net: 264700000, shipping: 2100000, shippingDiscount: 450000, total: 262250000, paid: 262250000 },
      ],
    },
    "this-year": {
      label: "Năm 2025",
      data: [
        { date: "Quý 1", orders: 210, revenue: 580000000, discount: 9200000, net: 570800000, shipping: 5400000, shippingDiscount: 900000, total: 565200000, paid: 565200000 },
        { date: "Quý 2", orders: 245, revenue: 640000000, discount: 11000000, net: 629000000, shipping: 6100000, shippingDiscount: 1100000, total: 623900000, paid: 623900000 },
        { date: "Quý 3", orders: 260, revenue: 705000000, discount: 12500000, net: 692500000, shipping: 6800000, shippingDiscount: 1400000, total: 684100000, paid: 684100000 },
        { date: "Quý 4", orders: 310, revenue: 830000000, discount: 15000000, net: 815000000, shipping: 7200000, shippingDiscount: 1600000, total: 807800000, paid: 807800000 },
      ],
    },
  };

  let chartInstance = null;

  // Vẽ biểu đồ cột đơn giản bằng canvas (không dùng thư viện ngoài)
  const ensureChart = () => {
    if (!chartCanvas) return null;
    const context = chartCanvas.getContext("2d");
    if (!context) return null;

    if (chartInstance) {
      chartInstance.destroy?.();
    }

    const { data, label } = datasetMap[reportRange.value] || datasetMap["this-month"];
    const labels = data.map((item) => item.date);
    const values = data.map((item) => item.net);

    legendLabel.textContent = label;

    const width = (chartCanvas.width = chartCanvas.clientWidth || 800);
    const height = (chartCanvas.height = chartCanvas.clientHeight || 360);
    const padding = 48;

    context.clearRect(0, 0, width, height);
    context.fillStyle = `rgba(${palette.primaryRgb}, 0.18)`;
    context.fillRect(0, 0, width, height);

    const maxValue = Math.max(...values) * 1.15;
    const barWidth = (width - padding * 2) / values.length - 36;
    const axisY = height - padding;

    // Trục
    context.strokeStyle = `rgba(${palette.mutedRgb}, 0.35)`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padding, padding);
    context.lineTo(padding, axisY);
    context.lineTo(width - padding + 12, axisY);
    context.stroke();

    // Vạch chia trục Y
    const steps = 4;
    context.fillStyle = `rgba(${palette.mutedRgb}, 0.72)`;
    context.font = "13px Inter, sans-serif";
    for (let i = 0; i <= steps; i += 1) {
      const value = (maxValue / steps) * i;
      const y = axisY - (value / maxValue) * (axisY - padding);
      const labelText = `${Math.round(value / 1_000_000).toLocaleString("vi-VN")} triệu`;
      context.fillText(labelText, padding - 52, y + 4);
      context.strokeStyle = `rgba(${palette.mutedRgb}, 0.22)`;
      context.beginPath();
      context.moveTo(padding, y);
      context.lineTo(width - padding, y);
      context.stroke();
    }

    // Cột
    values.forEach((value, index) => {
      const x = padding + index * (barWidth + 36) + 36;
      const barHeight = (value / maxValue) * (axisY - padding);
      const y = axisY - barHeight;
      const gradient = context.createLinearGradient(0, y, 0, axisY);
      gradient.addColorStop(0, palette.primary);
      gradient.addColorStop(1, palette.primaryDark);

      context.fillStyle = gradient;
      context.shadowColor = `rgba(${palette.accentRgb}, 0.16)`;
      context.shadowBlur = 22;
      context.fillRect(x, y, barWidth, barHeight);

      context.shadowBlur = 0;
      context.fillStyle = `rgba(${palette.mutedRgb}, 0.8)`;
      context.textAlign = "center";
      context.fillText(labels[index], x + barWidth / 2, axisY + 24);
    });

    return { context, labels, values };
  };

  // Định dạng tiền tệ VND
  const formatCurrency = (value) =>
    `${Number(value).toLocaleString("vi-VN")} ₫`;

  // Render bảng dữ liệu
  const renderTable = () => {
    const { data } = datasetMap[reportRange.value] || datasetMap["this-month"];
    tbody.innerHTML = "";

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.date}</td>
        <td>${row.orders}</td>
        <td class="money">${formatCurrency(row.revenue)}</td>
        <td class="money">${formatCurrency(row.discount)}</td>
        <td class="money">${formatCurrency(row.net)}</td>
        <td class="money">${formatCurrency(row.shipping)}</td>
        <td class="money">${formatCurrency(row.shippingDiscount)}</td>
        <td class="money">${formatCurrency(row.total)}</td>
        <td class="money">${formatCurrency(row.paid)}</td>
      `;
      tbody.appendChild(tr);
    });
  };

  // Sắp xếp dữ liệu theo cột
  const applySorting = (field, direction) => {
    const dataset = datasetMap[reportRange.value];
    if (!dataset) return;
    const multiplier = direction === "asc" ? 1 : -1;
    dataset.data.sort((a, b) => {
      if (typeof a[field] === "number") {
        return (a[field] - b[field]) * multiplier;
      }
      return a[field].localeCompare(b[field]) * multiplier;
    });
    renderTable();
  };

  let activeSortField = null;
  let activeSortDirection = "asc";

  // Bắt sự kiện click tiêu đề cột để sắp xếp
  const tableHeaders = document.querySelectorAll(".report-table th");
  tableHeaders.forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.dataset.sort;
      if (!field) return;

      if (activeSortField === field) {
        activeSortDirection = activeSortDirection === "asc" ? "desc" : "asc";
      } else {
        activeSortField = field;
        activeSortDirection = "asc";
      }

      tableHeaders.forEach((item) => {
        const indicator = item.querySelector(".sort-indicator");
        indicator?.classList.remove("is-active");
      });
      const indicator = th.querySelector(".sort-indicator");
      indicator?.classList.add("is-active");
      indicator.textContent = activeSortDirection === "asc" ? "↑" : "↓";

      applySorting(field, activeSortDirection);
    });
  });

  // Thay đổi phạm vi và so sánh -> cập nhật biểu đồ + bảng
  changeHandlers.forEach((control) => {
    control.addEventListener("change", () => {
      if (control === reportRange) {
        legendLabel.textContent = datasetMap[reportRange.value]?.label || "";
      }

      if (control === comparisonRange && control.value === "none") {
        filterTags.innerHTML = "";
      } else if (control === comparisonRange && !filterTags.childElementCount) {
        filterTags.innerHTML = `
          <button class="tag" data-filter="status">
            Trạng thái đơn hàng không phải Đã hủy
            <span class="tag-remove" aria-hidden="true">×</span>
          </button>
        `;
      }

      ensureChart();
      renderTable();
    });
  });

  // Xoá tag bộ lọc khi nhấp vào
  filterTags.addEventListener("click", (event) => {
    const button = event.target.closest(".tag");
    if (!button) return;
    button.remove();
  });

  // Khởi tạo
  ensureChart();
  renderTable();
});
