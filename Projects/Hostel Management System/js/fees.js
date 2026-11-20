/* Hostel-Management-System/js/fees.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let fees = storage.get('fees') || [];
    let students = storage.get('students') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'id';
    let sortDir = 'asc';

    const renderStats = () => {
        const total = fees.length;
        const paid = fees.filter(f => f.status === 'paid');
        const pending = fees.filter(f => f.status === 'pending');
        const collected = paid.reduce((a, f) => a + f.amount, 0);
        const pendingAmt = pending.reduce((a, f) => a + f.amount, 0);

        document.getElementById('feeStats').innerHTML = [
            { label: 'Total Records', value: total, icon: 'fas fa-file-invoice', color: 'indigo' },
            { label: 'Paid', value: paid.length, icon: 'fas fa-check-circle', color: 'green' },
            { label: 'Pending', value: pending.length, icon: 'fas fa-clock', color: 'red' },
            { label: 'Collected', value: AppCommon.formatCurrency(collected), icon: 'fas fa-money-bill-wave', color: 'green' },
            { label: 'Pending Amount', value: AppCommon.formatCurrency(pendingAmt), icon: 'fas fa-exclamation-triangle', color: 'yellow' },
            { label: 'Collection Rate', value: total > 0 ? Math.round((paid.length / total) * 100) + '%' : '0%', icon: 'fas fa-chart-pie', color: 'blue' }
        ].map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');
    };

    const renderCharts = () => {
        if (typeof Chart === 'undefined') return;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const collected = months.map(m => fees.filter(f => f.month === m && f.status === 'paid').reduce((a, f) => a + f.amount, 0));
        const pend = months.map(m => fees.filter(f => f.month === m && f.status === 'pending').reduce((a, f) => a + f.amount, 0));

        new Chart(document.getElementById('feeBarChart'), {
            type: 'bar',
            data: { labels: months, datasets: [{ label: 'Collected', data: collected, backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 4 }, { label: 'Pending', data: pend, backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
        });

        const types = ['Hostel Fee','Mess Fee','Electricity','Laundry','Sports'];
        const typeData = types.map(t => fees.filter(f => f.type === t).reduce((a, f) => a + f.amount, 0));
        new Chart(document.getElementById('feePieChart'), {
            type: 'doughnut',
            data: { labels: types, datasets: [{ data: typeData, backgroundColor: ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }, cutout: '60%' }
        });
    };

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const type = document.getElementById('filterType').value;
        const status = document.getElementById('filterStatus').value;
        const month = document.getElementById('filterMonth').value;
        return fees.filter(f => {
            const name = (f.studentName || '').toLowerCase();
            const matchSearch = !search || name.includes(search) || f.id.toLowerCase().includes(search);
            return matchSearch && (!type || f.type === type) && (!status || f.status === status) && (!month || f.month === month);
        });
    };

    const getSorted = (data) => [...data].sort((a, b) => {
        let valA = a[sortCol], valB = b[sortCol];
        if (sortCol === 'amount') { valA = Number(valA); valB = Number(valB); }
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

        const tbody = document.getElementById('feesBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><i class="fas fa-money-bill-wave"></i>No fee records found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(f => `<tr>
                <td class="font-semibold">${f.id}</td>
                <td>${f.studentName}</td>
                <td>${f.roomNumber || 'N/A'}</td>
                <td>${f.type}</td>
                <td class="font-semibold">${AppCommon.formatCurrency(f.amount)}</td>
                <td>${f.month} ${f.year}</td>
                <td>${AppCommon.formatDate(f.dueDate)}</td>
                <td><span class="badge badge-${f.status === 'paid' ? 'success' : 'danger'} badge-dot">${f.status}</span></td>
                <td><div class="table-actions">
                    ${f.status === 'pending' ? `<button class="btn-icon" title="Mark Paid" onclick="FeePage.markPaid('${f.id}')"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn-icon" title="Receipt" onclick="FeePage.receipt('${f.id}')"><i class="fas fa-receipt"></i></button>
                    <button class="btn-icon" title="Delete" onclick="FeePage.delete('${f.id}')"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="FeePage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="FeePage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="FeePage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    window.FeePage = {
        goPage(p) { currentPage = p; render(); },
        markPaid(id) {
            fees = storage.get('fees') || [];
            const idx = fees.findIndex(f => f.id === id);
            if (idx > -1) {
                fees[idx].status = 'paid';
                fees[idx].paidDate = new Date().toISOString().split('T')[0];
                fees[idx].mode = 'Cash';
                fees[idx].receipt = 'RCP' + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
                storage.set('fees', fees);
                AppCommon.toast('Fee marked as paid', 'success');
                renderStats(); render();
            }
        },
        receipt(id) {
            const f = fees.find(fe => fe.id === id);
            if (!f) return;
            AppCommon.openModal('Fee Receipt', `
                <div style="border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;">
                    <h2 style="color:var(--primary);margin-bottom:4px;">HostelMS</h2>
                    <p class="text-sm text-gray mb-3">Fee Payment Receipt</p>
                    <hr style="margin:16px 0;border-color:var(--light-2);">
                    <div class="form-grid" style="text-align:left;">
                        <div><span class="text-xs text-gray">Receipt No</span><p class="font-semibold">${f.receipt || 'N/A'}</p></div>
                        <div><span class="text-xs text-gray">Date</span><p class="font-semibold">${AppCommon.formatDate(f.paidDate)}</p></div>
                        <div><span class="text-xs text-gray">Student</span><p class="font-semibold">${f.studentName}</p></div>
                        <div><span class="text-xs text-gray">Room</span><p class="font-semibold">${f.roomNumber || 'N/A'}</p></div>
                        <div><span class="text-xs text-gray">Fee Type</span><p class="font-semibold">${f.type}</p></div>
                        <div><span class="text-xs text-gray">Period</span><p class="font-semibold">${f.month} ${f.year}</p></div>
                        <div><span class="text-xs text-gray">Payment Mode</span><p class="font-semibold">${f.mode || 'N/A'}</p></div>
                        <div><span class="text-xs text-gray">Status</span><p class="font-semibold"><span class="badge badge-${f.status === 'paid' ? 'success' : 'danger'} badge-dot">${f.status}</span></p></div>
                    </div>
                    <hr style="margin:16px 0;border-color:var(--light-2);">
                    <h2 style="color:var(--primary);font-size:28px;">${AppCommon.formatCurrency(f.amount)}</h2>
                    <p class="text-xs text-gray mt-2">This is a computer-generated receipt.</p>
                </div>
            `);
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Fee Record', 'Are you sure you want to delete this fee record?')) return;
            fees = storage.get('fees') || [];
            fees = fees.filter(f => f.id !== id);
            storage.set('fees', fees);
            AppCommon.toast('Fee record deleted', 'success');
            renderStats(); render();
        }
    };

    document.getElementById('addFeeBtn').addEventListener('click', () => {
        AppCommon.openModal('Add Fee Record', `
            <form id="feeForm">
                <div class="form-row-2">
                    <div class="form-group"><label class="form-label-required">Student</label><select class="form-control" name="studentId" required><option value="">Select Student</option>${students.map(s => `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName}</option>`).join('')}</select></div>
                    <div class="form-group"><label class="form-label-required">Fee Type</label><select class="form-control" name="type" required><option value="">Select</option><option>Hostel Fee</option><option>Mess Fee</option><option>Electricity</option><option>Laundry</option><option>Sports</option></select></div>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label class="form-label-required">Amount</label><input type="number" class="form-control" name="amount" required min="1"></div>
                    <div class="form-group"><label class="form-label-required">Month</label><select class="form-control" name="month" required><option value="">Select</option>${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => `<option>${m}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Year</label><input type="number" class="form-control" name="year" value="2024"></div>
                </div>
                <div class="form-row-2">
                    <div class="form-group"><label>Due Date</label><input type="date" class="form-control" name="dueDate"></div>
                    <div class="form-group"><label>Status</label><select class="form-control" name="status"><option value="pending">Pending</option><option value="paid">Paid</option></select></div>
                </div>
            </form>
        `);
        document.getElementById('feeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.amount = parseInt(data.amount);
            data.year = parseInt(data.year);
            const student = students.find(s => s.id === data.studentId);
            data.studentName = student ? `${student.firstName} ${student.lastName}` : '';
            data.roomNumber = student ? student.roomNumber : 'N/A';
            fees = storage.get('fees') || [];
            const newFee = { id: AppCommon.generateId('FEE', fees), ...data, paidDate: data.status === 'paid' ? new Date().toISOString().split('T')[0] : null, mode: data.status === 'paid' ? 'Cash' : null, receipt: data.status === 'paid' ? 'RCP' + String(Math.floor(Math.random() * 9999)).padStart(4, '0') : null };
            fees.push(newFee);
            storage.set('fees', fees);
            AppCommon.closeModal();
            AppCommon.toast('Fee record added', 'success');
            renderStats(); render();
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterType', 'filterStatus', 'filterMonth'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    document.querySelectorAll('#feesTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const data = getFiltered().map(f => ({ ID: f.id, Student: f.studentName, Room: f.roomNumber, Type: f.type, Amount: f.amount, Month: f.month, Year: f.year, Status: f.status }));
        AppCommon.exportToExcel(data, 'Fee_Report');
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const data = getFiltered().map(f => ({ ID: f.id, Student: f.studentName, Type: f.type, Amount: AppCommon.formatCurrency(f.amount), Month: f.month, Status: f.status }));
        AppCommon.exportToPdf('Fee Report', ['ID', 'Student', 'Type', 'Amount', 'Month', 'Status'], data, 'Fee_Report');
    });
    document.getElementById('printBtn').addEventListener('click', () => AppCommon.printTable('Fee Report', 'feesTable'));

    renderStats();
    renderCharts();
    render();
});