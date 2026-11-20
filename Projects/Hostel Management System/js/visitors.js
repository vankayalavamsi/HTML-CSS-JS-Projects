/* Hostel-Management-System/js/visitors.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let visitors = storage.get('visitors') || [];
    let students = storage.get('students') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'id';
    let sortDir = 'desc';

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const purpose = document.getElementById('filterPurpose').value;
        const status = document.getElementById('filterStatus').value;
        return visitors.filter(v => {
            const matchSearch = !search || v.name.toLowerCase().includes(search) || v.studentName.toLowerCase().includes(search) || v.phone.includes(search);
            return matchSearch && (!purpose || v.purpose === purpose) && (!status || v.status === status);
        });
    };

    const getSorted = (data) => [...data].sort((a, b) => {
        let valA = a[sortCol], valB = b[sortCol];
        if (sortCol === 'inTime') { valA = new Date(valA); valB = new Date(valB); }
        else if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const formatTime = (iso) => {
        if (!iso) return 'N/A';
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const render = () => {
        const filtered = getFiltered();
        const sorted = getSorted(filtered);
        const total = sorted.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * perPage;
        const pageData = sorted.slice(start, start + perPage);

        const tbody = document.getElementById('visitorsBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="table-empty"><i class="fas fa-id-card"></i>No visitors found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(v => `<tr>
                <td class="font-semibold">${v.id}</td>
                <td><strong>${v.name}</strong><br><span class="text-xs text-gray">${v.idProof}</span></td>
                <td>${v.phone}</td>
                <td>${v.studentName}</td>
                <td>${v.roomNumber || 'N/A'}</td>
                <td>${v.purpose}</td>
                <td class="text-sm">${formatTime(v.inTime)}</td>
                <td class="text-sm">${formatTime(v.outTime)}</td>
                <td><span class="badge badge-${v.status === 'in' ? 'success' : 'secondary'} badge-dot">${v.status === 'in' ? 'In' : 'Out'}</span></td>
                <td><div class="table-actions">
                    ${v.status === 'in' ? `<button class="btn-icon" title="Check Out" onclick="VisitorPage.checkout('${v.id}')"><i class="fas fa-sign-out-alt"></i></button>` : ''}
                    <button class="btn-icon" title="Delete" onclick="VisitorPage.delete('${v.id}')"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="VisitorPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="VisitorPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="VisitorPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    window.VisitorPage = {
        goPage(p) { currentPage = p; render(); },
        checkout(id) {
            visitors = storage.get('visitors') || [];
            const idx = visitors.findIndex(v => v.id === id);
            if (idx > -1) {
                visitors[idx].status = 'out';
                visitors[idx].outTime = new Date().toISOString();
                storage.set('visitors', visitors);
                AppCommon.toast('Visitor checked out', 'success');
                render();
            }
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Visitor', 'Delete this visitor record?')) return;
            visitors = storage.get('visitors') || [];
            visitors = visitors.filter(v => v.id !== id);
            storage.set('visitors', visitors);
            AppCommon.toast('Visitor record deleted', 'success');
            render();
        }
    };

    document.getElementById('addVisitorBtn').addEventListener('click', () => {
        AppCommon.openModal('Register Visitor', `
            <form id="visitorForm">
                <div class="form-row-2">
                    <div class="form-group"><label class="form-label-required">Visitor Name</label><input type="text" class="form-control" name="name" required></div>
                    <div class="form-group"><label class="form-label-required">Phone</label><input type="tel" class="form-control" name="phone" required></div>
                </div>
                <div class="form-row-2">
                    <div class="form-group"><label>Address</label><input type="text" class="form-control" name="address"></div>
                    <div class="form-group"><label>ID Proof</label><select class="form-control" name="idProof"><option>Aadhar</option><option>PAN</option><option>Driving License</option><option>Passport</option><option>Other</option></select></div>
                </div>
                <div class="form-row-2">
                    <div class="form-group"><label class="form-label-required">Visiting Student</label><select class="form-control" name="studentId" required><option value="">Select Student</option>${students.map(s => `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName} (${s.roomNumber || 'No Room'})</option>`).join('')}</select></div>
                    <div class="form-group"><label class="form-label-required">Purpose</label><select class="form-control" name="purpose" required><option value="">Select</option><option>Parent Visit</option><option>Friend Visit</option><option>Delivery</option><option>Maintenance</option><option>Official</option><option>Other</option></select></div>
                </div>
            </form>
        `);
        document.getElementById('visitorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            const student = students.find(s => s.id === data.studentId);
            visitors = storage.get('visitors') || [];
            visitors.push({
                id: AppCommon.generateId('VIS', visitors), ...data,
                studentName: student ? `${student.firstName} ${student.lastName}` : '',
                roomNumber: student ? student.roomNumber : 'N/A',
                inTime: new Date().toISOString(), outTime: null, status: 'in'
            });
            storage.set('visitors', visitors);
            AppCommon.closeModal();
            AppCommon.toast('Visitor registered successfully', 'success');
            render();
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterPurpose', 'filterStatus'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    document.querySelectorAll('#visitorsTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const data = getFiltered().map(v => ({ ID: v.id, Name: v.name, Phone: v.phone, 'Visiting': v.studentName, Room: v.roomNumber, Purpose: v.purpose, 'In Time': formatTime(v.inTime), 'Out Time': formatTime(v.outTime), Status: v.status }));
        AppCommon.exportToExcel(data, 'Visitor_Report');
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const data = getFiltered().map(v => ({ Name: v.name, Phone: v.phone, Visiting: v.studentName, Room: v.roomNumber, Purpose: v.purpose, 'In Time': formatTime(v.inTime), Status: v.status }));
        AppCommon.exportToPdf('Visitor Report', ['Name', 'Phone', 'Visiting', 'Room', 'Purpose', 'In Time', 'Status'], data, 'Visitor_Report');
    });

    render();
});