document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const rows = Array.from(document.querySelectorAll(".product-row"));
  const searchInput = document.getElementById("search-input");
  const selectAll = document.getElementById("select-all");
  const detailPanel = document.getElementById("detail-panel");
  const detailWrapper = detailPanel.querySelector(".detail");
  const detailPlaceholder = detailPanel.querySelector(".detail-placeholder");

  const ui = {
    status: document.getElementById("detail-status"),
    name: document.getElementById("detail-name"),
    meta: document.getElementById("detail-meta"),
    category: document.getElementById("detail-category"),
    group: document.getElementById("detail-group"),
    price: document.getElementById("detail-price"),
    description: document.getElementById("detail-description"),
    protein: document.getElementById("detail-protein"),
    carbs: document.getElementById("detail-carbs"),
    fat: document.getElementById("detail-fat"),
    image: document.getElementById("detail-image"),
    gallery: document.getElementById("detail-gallery"),
  };

  let activeFilter = "all";
  let searchTerm = "";
  let activeRow = null;
  const statusClassMap = {
    active: "available",
    draft: "draft",
    archive: "archived",
  };

  const updateStatusPill = (statusKey) => {
    ui.status.classList.remove("available", "draft", "archived");
    const mapped = statusClassMap[statusKey] || "available";
    ui.status.classList.add(mapped);
  };

  const updateSelectAllState = () => {
    if (!selectAll) return;
    const visibleRows = rows.filter((row) => !row.hidden);
    if (visibleRows.length === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
      return;
    }

    const checkedCount = visibleRows.reduce((count, row) => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      return checkbox && checkbox.checked ? count + 1 : count;
    }, 0);

    selectAll.checked = checkedCount === visibleRows.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < visibleRows.length;
  };

  const setActiveRow = (row) => {
    if (activeRow === row) {
      return;
    }

    rows.forEach((item) => item.classList.remove("is-active"));

    if (!row) {
      activeRow = null;
      detailWrapper.hidden = true;
      detailPlaceholder.hidden = false;
      return;
    }

    activeRow = row;
    row.classList.add("is-active");

    const statusKey = row.dataset.status || "active";
    const statusLabel = row.dataset.statusLabel || "";
    const name = row.dataset.name || row.querySelector(".product-name")?.textContent?.trim() || "";
    const meta = row.dataset.meta || "";
    const category = row.dataset.category || row.children[2]?.textContent?.trim() || "";
    const group = row.dataset.group || row.children[3]?.textContent?.trim() || "";
    const price = row.dataset.price || row.children[4]?.textContent?.trim() || "";
    const description = row.dataset.description || "Chưa có mô tả cho sản phẩm này.";
    const image = row.dataset.image || row.querySelector("img")?.src || "";
    const protein = row.dataset.protein || "";
    const carbs = row.dataset.carbs || "";
    const fat = row.dataset.fat || "";
    const gallery = (row.dataset.gallery || "")
      .split("|")
      .map((url) => url.trim())
      .filter(Boolean);

    ui.status.textContent = statusLabel;
    updateStatusPill(statusKey);
    ui.name.textContent = name;
    ui.meta.textContent = meta;
    ui.category.textContent = category;
    ui.group.textContent = group;
    ui.price.textContent = price;
    ui.description.textContent = description;
    if (ui.protein) {
      ui.protein.textContent = protein ? `${protein} g` : "—";
    }
    if (ui.carbs) {
      ui.carbs.textContent = carbs ? `${carbs} g` : "—";
    }
    if (ui.fat) {
      ui.fat.textContent = fat ? `${fat} g` : "—";
    }

    if (image) {
      ui.image.src = image;
      ui.image.alt = name;
    }

    ui.gallery.innerHTML = "";
    gallery.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = name;
      ui.gallery.appendChild(img);
    });

    detailPlaceholder.hidden = true;
    detailWrapper.hidden = false;
  };

  const matchesSearch = (row) => {
    if (!searchTerm) return true;
    const name = row.dataset.name || "";
    const category = row.dataset.category || "";
    const group = row.dataset.group || "";
    const haystack = [name, category, group].join(" ").toLowerCase();
    return haystack.includes(searchTerm);
  };

  const matchesStatus = (row) => {
    if (activeFilter === "all") return true;
    return row.dataset.status === activeFilter;
  };

  const applyFilters = () => {
    let firstVisibleRow = null;
    rows.forEach((row) => {
      const visible = matchesStatus(row) && matchesSearch(row);
      row.hidden = !visible;

      if (visible && !firstVisibleRow) {
        firstVisibleRow = row;
      }
    });

    if (activeRow && activeRow.hidden) {
      setActiveRow(firstVisibleRow);
    }

    updateSelectAllState();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.dataset.filter || "all";
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  rows.forEach((row) => {
    row.tabIndex = 0;
    row.addEventListener("click", () => setActiveRow(row));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveRow(row);
      }
    });

    const checkbox = row.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener("change", updateSelectAllState);
    }
  });

  if (selectAll) {
    selectAll.addEventListener("change", () => {
      selectAll.indeterminate = false;
      rows
        .filter((row) => !row.hidden)
        .forEach((row) => {
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = selectAll.checked;
          }
        });

      updateSelectAllState();
    });
  }

  // Initialize default selection on first visible row
  applyFilters();
  const initialRow = rows.find((row) => !row.hidden);
  if (initialRow) {
    setActiveRow(initialRow);
  }
});
