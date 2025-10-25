/* ==================== GLOBAL VARIABLES ==================== */
let allCustomers = [];
let filteredCustomers = [];
let sortField = null;
let sortDir = "asc";

/* ==================== COLUMN CONFIGURATION ==================== */
const columns = {
    customer: { label: 'Khách hàng', visible: 1, required: true },
    phone: { label: 'Điện thoại', visible: 1 },
    email: { label: 'Email', visible: 1 },
    address: { label: 'Địa chỉ', visible: 1 },
    lastorder: { label: 'Đơn gần nhất', visible: 1 },
    totalorders: { label: 'Số lượng đơn', visible: 1, sort: 'totalOrders' },
    avgvalue: { label: 'ĐH trung bình', visible: 1, sort: 'avgOrderValue' },
    debt: { label: 'Nợ', visible: 1, sort: 'debt' },
    totalspent: { label: 'Tổng chi', visible: 1, sort: 'totalSpent' },
    lastupdate: { label: 'Cập nhật', visible: 1, sort: 'lastUpdate' }
};

/* ==================== FORMATTING FUNCTIONS ==================== */
const fmt = (n) => new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(n);

const fmtDate = (d) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
};

/* ==================== GET CELL CONTENT ==================== */
const getCell = (c, k) => {
    const m = {
        customer: `<span class="customer-name">${c.name}</span>`,
        phone: c.phone || '--',
        email: c.email || '--',
        address: c.address || '--',
        lastorder: c.lastOrder ? `<span class="order-link">${c.lastOrder.orderId}</span>` : '--',
        totalorders: c.totalOrders,
        avgvalue: fmt(c.avgOrderValue),
        debt: fmt(c.debt),
        totalspent: fmt(c.totalSpent),
        lastupdate: fmtDate(c.lastUpdate)
    };
    return m[k] || '--';
};

/* ==================== SORT FUNCTION ==================== */
const sort = (f, d) => {
    filteredCustomers.sort((a, b) => {
        let [av, bv] = [a[f], b[f]];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (f === "lastUpdate" || f === "lastOrderDate") {
            [av, bv] = [new Date(av).getTime(), new Date(bv).getTime()];
        }
        return (typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))) * (d === "asc" ? 1 : -1);
    });
    render();
};

/* ==================== RENDER TABLE HEADER ==================== */
const renderHeader = () => {
    let h = '<th style="width:40px"><input type="checkbox" class="checkbox" id="selectAll"></th>';
    
    Object.keys(columns).forEach(k => {
        const c = columns[k];
        if (!c.visible) return;
        const cls = c.sort ? 'sortable' : '';
        const attr = c.sort ? `data-sort="${c.sort}"` : '';
        h += `<th class="${cls}" data-col="${k}" ${attr}>${c.label}${c.sort ? '<span class="sort-indicator">↕</span>' : ''}</th>`;
    });
    document.getElementById('tableHeader').innerHTML = h;
    
    document.getElementById('selectAll').onchange = (e) => {
        document.querySelectorAll('tbody .checkbox').forEach(cb => cb.checked = e.target.checked);
        updateDeleteButton();
    };
    
    document.querySelectorAll("thead th.sortable").forEach(th => {
        th.onclick = () => {
            const f = th.dataset.sort;
            if (!f) return;
            sortDir = sortField === f && sortDir === "asc" ? "desc" : "asc";
            sortField = f;
            document.querySelectorAll(".sort-indicator").forEach(i => {
                i.classList.remove("active"); 
                i.textContent = "↕";
            });
            const ind = th.querySelector(".sort-indicator");
            if (ind) {
                ind.classList.add("active"); 
                ind.textContent = sortDir === "asc" ? "↑" : "↓";
            }
            sort(f, sortDir);
        };
    });
};

/* ==================== RENDER TABLE BODY ==================== */
const render = () => {
    const tbody = document.getElementById('customerTableBody');
    
    if (!filteredCustomers.length) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px">Không tìm thấy khách hàng</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredCustomers.map(c => {
        let r = '<td><input type="checkbox" class="checkbox" onclick="event.stopPropagation()"></td>';
        Object.keys(columns).forEach(k => {
            if (columns[k].visible) r += `<td>${getCell(c, k)}</td>`;
        });
        return `<tr data-id="${c.id}">${r}</tr>`;
    }).join('');
    
    document.querySelectorAll("#customerTableBody tr").forEach(row => {
        const id = row.dataset.id;
        if (!id) return;
        
        row.onclick = (e) => {
            if (e.target.type === 'checkbox') return;
            localStorage.setItem("selectedCustomerId", id);
            window.location.href = "../html/customer-detail.html";
        };
        
        const checkbox = row.querySelector('.checkbox');
        if (checkbox) checkbox.onchange = updateDeleteButton;
    });
};

/* ==================== UPDATE CUSTOMER COUNT ==================== */
const updateCount = () => 
    document.getElementById('customerCount').textContent = `Có ${filteredCustomers.length} khách hàng`;

/* ==================== UPDATE DELETE BUTTON ==================== */
const updateDeleteButton = () => {
    const checkedBoxes = document.querySelectorAll('tbody .checkbox:checked');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (checkedBoxes.length > 0) {
        deleteBtn.classList.remove('disabled');
        deleteBtn.textContent = '';
        const img = document.createElement('img');
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E";
        img.alt = 'Xóa';
        deleteBtn.appendChild(img);
        deleteBtn.appendChild(document.createTextNode(`Xóa ${checkedBoxes.length} khách hàng`));
    } else {
        deleteBtn.classList.add('disabled');
        deleteBtn.textContent = '';
        const img = document.createElement('img');
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E";
        img.alt = 'Xóa';
        deleteBtn.appendChild(img);
        deleteBtn.appendChild(document.createTextNode('Xóa đã chọn'));
    }
    
    const selectAll = document.getElementById('selectAll');
    const allBoxes = document.querySelectorAll('tbody .checkbox');
    if (selectAll && allBoxes.length > 0) {
        selectAll.checked = checkedBoxes.length === allBoxes.length;
    }
};

/* ==================== DELETE HANDLER ==================== */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('deleteBtn').onclick = () => {
        const deleteBtn = document.getElementById('deleteBtn');
        
        if (deleteBtn.classList.contains('disabled')) return;
        
        const checkedBoxes = document.querySelectorAll('tbody .checkbox:checked');
        if (checkedBoxes.length === 0) return;
        
        const customerNames = [];
        const rowsToDelete = [];
        checkedBoxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                const nameCell = row.querySelector('td:nth-child(2) .customer-name');
                if (nameCell) customerNames.push(nameCell.textContent);
                rowsToDelete.push(row);
            }
        });
        
        const confirmMsg = customerNames.length === 1 
            ? `Bạn có chắc muốn xóa khách hàng [${customerNames[0]}] không?`
            : `Bạn có chắc muốn xóa ${customerNames.length} khách hàng đã chọn không?\n\n${customerNames.slice(0, 5).join('\n')}${customerNames.length > 5 ? '\n...' : ''}`;
        
        if (confirm(confirmMsg)) {
            const idsToDelete = [];
            rowsToDelete.forEach(row => {
                const id = row.dataset.id;
                if (id) idsToDelete.push(id);
            });
            
            allCustomers = allCustomers.filter(c => !idsToDelete.includes(c.id));
            filteredCustomers = filteredCustomers.filter(c => !idsToDelete.includes(c.id));
            
            render();
            updateCount();
            updateDeleteButton();
            document.getElementById('selectAll').checked = false;
            alert(`Đã xóa ${idsToDelete.length} khách hàng thành công!`);
        }
    };
});

/* ==================== LOAD DATA ==================== */
async function load() {
    try {
        const res = await fetch('../data/cus.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        allCustomers = data.customers || [];
        filteredCustomers = [...allCustomers];
        renderHeader();
        render();
        updateCount();
    } catch (err) {
        document.getElementById('customerTableBody').innerHTML = `
            <tr><td colspan="11" class="error">
                <strong>❌ Không thể tải dữ liệu</strong><br><br>
                ${err.message}<br><br>
                <small>Kiểm tra: File ../data/cus.json có tồn tại và đang chạy qua HTTP server</small>
            </td></tr>`;
        document.getElementById('customerCount').textContent = "Lỗi tải dữ liệu";
    }
}

/* ==================== SEARCH HANDLER ==================== */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput').oninput = (e) => {
        const s = e.target.value.toLowerCase().trim();
        
        filteredCustomers = s === '' ? [...allCustomers] : allCustomers.filter(c => 
            c.name.toLowerCase().includes(s) || 
            (c.phone && c.phone.includes(s)) || 
            (c.email && c.email.toLowerCase().includes(s))
        );
        
        sortField ? sort(sortField, sortDir) : render();
        updateCount();
        
        document.getElementById('selectAll').checked = false;
        updateDeleteButton();
    };
});

/* ==================== COLUMN TOGGLE ==================== */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('columnToggleBtn');
    const selector = document.getElementById('columnSelector');

    toggle.onclick = (e) => {
        e.stopPropagation(); 
        selector.classList.toggle('active'); 
        toggle.classList.toggle('active');
    };

    document.onclick = (e) => {
        if (!selector.contains(e.target) && e.target !== toggle) {
            selector.classList.remove('active'); 
            toggle.classList.remove('active');
        }
    };
});

/* ==================== COLUMN VISIBILITY ==================== */
const colMap = {
    'col-customer':'customer',
    'col-phone':'phone',
    'col-email':'email',
    'col-address':'address',
    'col-lastupdate':'lastupdate',
    'col-lastorder':'lastorder',
    'col-totalorders':'totalorders',
    'col-avgvalue':'avgvalue',
    'col-debt':'debt',
    'col-totalspent':'totalspent'
};

document.addEventListener('DOMContentLoaded', () => {
    Object.keys(colMap).forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox || checkbox.disabled) return;
        
        checkbox.onchange = (e) => {
            columns[colMap[id]].visible = e.target.checked ? 1 : 0;
            renderHeader();
            render();
        };
    });
});

/* ==================== INITIALIZE ==================== */
document.addEventListener('DOMContentLoaded', load);
