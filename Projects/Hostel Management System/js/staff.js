/* Hostel-Management-System/js/staff.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let staff = storage.get('staff') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'id';
    let sortDir = 'asc';

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const role = document.getElementById('filterRole').value;
        const dept = document.getElementById('filterDept').value;
        const status = document.getElementById('filterStatus').value;
        return staff.filter(s => {
            const matchSearch = !search || s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.phone.includes(search);
            return matchSearch && (!role || s.role === role) && (!dept || s.department === dept) && (!status || s.status === status);
        });
    };

    const getSorted = (data) => [...data].sort((a, b) => {
        let valA = a[sortCol], valB = b[sortCol];
        if (sortCol === 'salary') { valA = Number(valA); valB = Number(valB); }
        if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const render = () => {
        const filtered = getFiltered();
        const sorted = getSorted(filtered);
        const total = sorted.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * perPage;
        const pageData = sorted.slice(start, start + perPage);

        const tbody = document.getElementById('staffBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><i class="fas fa-user-tie"></i>No staff found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(s => `<tr>
                <td class="font-semibold">${s.id}</td>
                <td><div class="cell-flex"><div class="table-avatar">${s.name.charAt(0)}</div><div class="cell-flex-info"><span class="name">${s.name}</span><span class="sub">${s.id}</span></div></div></td>
                <td>${s.role}</td>
                <td>${s.department}</td>
                <td>${s.phone}</td>
                <td class="text-sm">${s.email}</td>
                <td class="font-semibold">${AppCommon.formatCurrency(s.salary)}</td>
                <td><span class="badge badge-${s.status === 'active' ? 'success' : 'danger'} badge-dot">${s.status}</span></td>
                <td><div class="table-actions">
                    <button class="btn-icon" title="Edit" onclick="StaffPage.edit('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" title="Delete" onclick="StaffPage.delete('${s.id}')"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="StaffPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="StaffPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="StaffPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    const getFormHtml = (s = null) => `
        <form id="staffForm">
            <div class="form-row-2">
                <div class="form-group"><label class="form-label-required">Name</label><input type="text" class="form-control" name="name" value="${s ? s.name : ''}" required></div>
                <div class="form-group"><label class="form-label-required">Email</label><input type="email" class="form-control" name="email" value="${s ? s.email : ''}" required></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label class="form-label-required">Phone</label><input type="tel" class="form-control" name="phone" value="${s ? s.phone : ''}" required></div>
                <div class="form-group"><label class="form-label-required">Role</label><select class="form-control" name="role" required><option value="">Select</option>${['Warden','Security Guard','Cook','Cleaner','Electrician','Plumber','Clerk','Supervisor','Peon','Gardener'].map(r => `<option ${s && s.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label class="form-label-required">Department</label><select class="form-control" name="department" required><option value="">Select</option>${['Administration','Security','Mess','Maintenance','Housekeeping','Electrical','Plumbing','Office','General','Grounds'].map(d => `<option ${s && s.department === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
                <div class="form-group"><label class="form-label-required">Salary</label><input type="number" class="form-control" name="salary" value="${s ? s.salary : ''}" required min="1"></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label>Join Date</label><input type="date" class="form-control" name="joinDate" value="${s ? s.joinDate : new Date().toISOString().split('T')[0]}"></div>
                <div class="form-group"><label>Status</label><select class="form-control" name="status"><option value="active" ${!s || s.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${s && s.status === 'inactive' ? 'selected' : ''}>Inactive</option></select></div>
            </div>
            <div class="form-group"><label>Address</label><textarea class="form-control" name="address" rows="2">${s ? s.address : ''}</textarea></div>
            <input type="hidden" name="id" value="${s ? s.id : ''}">
        </form>
    `;

    window.StaffPage = {
        goPage(p) { currentPage = p; render(); },
        edit(id) {
            const s = staff.find(st => st.id === id);
            if (!s) return;
            AppCommon.openModal('Edit Staff', getFormHtml(s));
            document.getElementById('staffForm').addEventListener('submit', saveStaff);
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Staff', 'Are you sure you want to delete this staff member?')) return;
            staff = storage.get('staff') || [];
            staff = staff.filter(s => s.id !== id);
            storage.set('staff', staff);
            AppCommon.toast('Staff deleted successfully', 'success');
            render();
        }
    };

    const saveStaff = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        data.salary = parseInt(data.salary);
        if (!data.name || !data.email || !data.phone || !data.role || !data.department || !data.salary) {
            AppCommon.toast('Please fill all required fields', 'warning');
            return;
        }
        staff = storage.get('staff') || [];
        if (data.id) {
            const idx = staff.findIndex(s => s.id === data.id);
            if (idx > -1) { staff[idx] = { ...staff[idx], ...data }; AppCommon.toast('Staff updated', 'success'); }
        } else {
            staff.push({ id: AppCommon.generateId('STF', staff), ...data });
            AppCommon.toast('Staff added', 'success');
        }
        storage.set('staff', staff);
        AppCommon.closeModal();
        render();
    };

    document.getElementById('addStaffBtn').addEventListener('click', () => {
        AppCommon.openModal('Add Staff', getFormHtml());
        document.getElementById('staffForm').addEventListener('submit', saveStaff);
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterRole', 'filterDept', 'filterStatus'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    document.querySelectorAll('#staffTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const data = getFiltered().map(s => ({ ID: s.id, Name: s.name, Role: s.role, Department: s.department, Phone: s.phone, Email: s.email, Salary: s.salary, Status: s.status }));
        AppCommon.exportToExcel(data, 'Staff_Report');
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const data = getFiltered().map(s => ({ ID: s.id, Name: s.name, Role: s.role, Department: s.department, Phone: s.phone, Salary: AppCommon.formatCurrency(s.salary), Status: s.status }));
        AppCommon.exportToPdf('Staff Report', ['ID', 'Name', 'Role', 'Department', 'Phone', 'Salary', 'Status'], data, 'Staff_Report');
    });

    render();
});