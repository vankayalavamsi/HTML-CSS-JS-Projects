/* Hostel-Management-System/js/complaints.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let complaints = storage.get('complaints') || [];
    let students = storage.get('students') || [];
    let staffList = storage.get('staff') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'createdAt';
    let sortDir = 'desc';

    const renderStats = () => {
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in-progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        const closed = complaints.filter(c => c.status === 'closed').length;
        const critical = complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length;

        document.getElementById('compStats').innerHTML = [
            { label: 'Total', value: complaints.length, icon: 'fas fa-exclamation-circle', color: 'indigo' },
            { label: 'Pending', value: pending, icon: 'fas fa-clock', color: 'yellow' },
            { label: 'In Progress', value: inProgress, icon: 'fas fa-spinner', color: 'blue' },
            { label: 'Resolved', value: resolved, icon: 'fas fa-check-circle', color: 'green' },
            { label: 'Closed', value: closed, icon: 'fas fa-lock', color: 'secondary' },
            { label: 'High/Critical', value: critical, icon: 'fas fa-fire', color: 'red' }
        ].map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');
    };

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const priority = document.getElementById('filterPriority').value;
        const status = document.getElementById('filterStatus').value;
        return complaints.filter(c => {
            const matchSearch = !search || c.subject.toLowerCase().includes(search) || c.studentName.toLowerCase().includes(search) || c.id.toLowerCase().includes(search);
            return matchSearch && (!category || c.category === category) && (!priority || c.priority === priority) && (!status || c.status === status);
        });
    };

    const getSorted = (data) => [...data].sort((a, b) => {
        let valA = a[sortCol], valB = b[sortCol];
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

        const tbody = document.getElementById('complaintsBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><i class="fas fa-exclamation-circle"></i>No complaints found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(c => {
                const statusMap = { 'pending': 'warning', 'in-progress': 'info', 'resolved': 'success', 'closed': 'secondary' };
                const prioMap = { 'Low': 'secondary', 'Medium': 'info', 'High': 'danger', 'Critical': 'danger' };
                return `<tr>
                    <td class="font-semibold">${c.id}</td>
                    <td>${c.studentName}</td>
                    <td>${c.roomNumber || 'N/A'}</td>
                    <td>${c.category}</td>
                    <td><span class="truncate" style="max-width:150px;display:inline-block;" title="${c.subject}">${c.subject}</span></td>
                    <td><span class="badge badge-${prioMap[c.priority] || 'secondary'}">${c.priority}</span></td>
                    <td><span class="badge badge-${statusMap[c.status] || 'secondary'} badge-dot">${c.status}</span></td>
                    <td class="text-sm">${c.assignedTo || 'N/A'}</td>
                    <td><div class="table-actions">
                        <button class="btn-icon" title="View Details" onclick="CompPage.view('${c.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon" title="Edit Status" onclick="CompPage.edit('${c.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="Delete" onclick="CompPage.delete('${c.id}')"><i class="fas fa-trash"></i></button>
                    </div></td>
                </tr>`;
            }).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="CompPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="CompPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="CompPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    window.CompPage = {
        goPage(p) { currentPage = p; render(); },
        view(id) {
            const c = complaints.find(cm => cm.id === id);
            if (!c) return;
            const statusMap = { 'pending': 'warning', 'in-progress': 'info', 'resolved': 'success', 'closed': 'secondary' };
            AppCommon.openModal(`Complaint ${c.id}`, `
                <div class="d-flex justify-between align-center mb-3">
                    <span class="badge badge-${statusMap[c.status] || 'secondary'} badge-dot" style="font-size:13px;padding:6px 14px;">${c.status.toUpperCase()}</span>
                    <span class="badge badge-${c.priority === 'Critical' || c.priority === 'High' ? 'danger' : 'info'}">${c.priority} PRIORITY</span>
                </div>
                <h3 class="mb-2">${c.subject}</h3>
                <p class="text-sm text-gray mb-3">${c.description}</p>
                <div class="form-grid mb-3">
                    <div><span class="text-xs text-gray">Student</span><p class="font-semibold">${c.studentName}</p></div>
                    <div><span class="text-xs text-gray">Room</span><p class="font-semibold">${c.roomNumber || 'N/A'}</p></div>
                    <div><span class="text-xs text-gray">Category</span><p class="font-semibold">${c.category}</p></div>
                    <div><span class="text-xs text-gray">Assigned To</span><p class="font-semibold">${c.assignedTo || 'Unassigned'}</p></div>
                    <div><span class="text-xs text-gray">Created</span><p class="font-semibold">${AppCommon.formatDate(c.createdAt)}</p></div>
                    <div><span class="text-xs text-gray">Resolved</span><p class="font-semibold">${c.resolvedAt ? AppCommon.formatDate(c.resolvedAt) : 'N/A'}</p></div>
                </div>
                <h4 class="mb-2" style="font-size:14px;">Timeline</h4>
                <div style="border-left:2px solid var(--primary);margin-left:12px;padding-left:16px;">
                    ${(c.timeline || []).map(t => `<div style="margin-bottom:12px;position:relative;"><div style="position:absolute;left:-22px;top:2px;width:10px;height:10px;border-radius:50%;background:var(--primary);"></div><p class="font-semibold text-sm">${t.action}</p><span class="text-xs text-gray">${AppCommon.formatDate(t.date)} by ${t.by}</span></div>`).join('')}
                </div>
            `, 'lg');
        },
        edit(id) {
            const c = complaints.find(cm => cm.id === id);
            if (!c) return;
            AppCommon.openModal('Update Complaint', `
                <form id="compForm">
                    <div class="form-row-2">
                        <div class="form-group"><label>Status</label><select class="form-control" name="status"><option value="pending" ${c.status === 'pending' ? 'selected' : ''}>Pending</option><option value="in-progress" ${c.status === 'in-progress' ? 'selected' : ''}>In Progress</option><option value="resolved" ${c.status === 'resolved' ? 'selected' : ''}>Resolved</option><option value="closed" ${c.status === 'closed' ? 'selected' : ''}>Closed</option></select></div>
                        <div class="form-group"><label>Assign To</label><select class="form-control" name="assignedTo"><option value="">Unassigned</option>${staffList.map(s => `<option ${c.assignedTo === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}</select></div>
                    </div>
                    <div class="form-group"><label>Priority</label><select class="form-control" name="priority"><option value="Low" ${c.priority === 'Low' ? 'selected' : ''}>Low</option><option value="Medium" ${c.priority === 'Medium' ? 'selected' : ''}>Medium</option><option value="High" ${c.priority === 'High' ? 'selected' : ''}>High</option><option value="Critical" ${c.priority === 'Critical' ? 'selected' : ''}>Critical</option></select></div>
                    <input type="hidden" name="id" value="${c.id}">
                </form>
            `);
            document.getElementById('compForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.target).entries());
                complaints = storage.get('complaints') || [];
                const idx = complaints.findIndex(cm => cm.id === data.id);
                if (idx > -1) {
                    const oldStatus = complaints[idx].status;
                    complaints[idx].status = data.status;
                    complaints[idx].assignedTo = data.assignedTo;
                    complaints[idx].priority = data.priority;
                    if ((data.status === 'resolved' || data.status === 'closed') && !complaints[idx].resolvedAt) {
                        complaints[idx].resolvedAt = new Date().toISOString().split('T')[0];
                    }
                    complaints[idx].timeline.push({ date: new Date().toISOString().split('T')[0], action: `Status changed from ${oldStatus} to ${data.status}`, by: session.name });
                    if (data.assignedTo !== complaints[idx].assignedTo) {
                        complaints[idx].timeline.push({ date: new Date().toISOString().split('T')[0], action: `Assigned to ${data.assignedTo}`, by: session.name });
                    }
                    storage.set('complaints', complaints);
                    AppCommon.closeModal();
                    AppCommon.toast('Complaint updated', 'success');
                    renderStats(); render();
                }
            });
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Complaint', 'Delete this complaint?')) return;
            complaints = storage.get('complaints') || [];
            complaints = complaints.filter(c => c.id !== id);
            storage.set('complaints', complaints);
            AppCommon.toast('Complaint deleted', 'success');
            renderStats(); render();
        }
    };

    document.getElementById('addComplaintBtn').addEventListener('click', () => {
        AppCommon.openModal('New Complaint', `
            <form id="compForm">
                <div class="form-row-2">
                    <div class="form-group"><label class="form-label-required">Student</label><select class="form-control" name="studentId" required><option value="">Select Student</option>${students.map(s => `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName}</option>`).join('')}</select></div>
                    <div class="form-group"><label class="form-label-required">Category</label><select class="form-control" name="category" required><option value="">Select</option><option>Electrical</option><option>Plumbing</option><option>Furniture</option><option>Cleanliness</option><option>Noise</option><option>Internet</option><option>Water</option><option>Security</option><option>Food</option><option>Other</option></select></div>
                </div>
                <div class="form-group"><label class="form-label-required">Subject</label><input type="text" class="form-control" name="subject" required></div>
                <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3"></textarea></div>
                <div class="form-row-2">
                    <div class="form-group"><label>Priority</label><select class="form-control" name="priority"><option>Low</option><option>Medium</option><option selected>High</option><option>Critical</option></select></div>
                    <div class="form-group"><label>Assign To</label><select class="form-control" name="assignedTo"><option value="">Unassigned</option>${staffList.map(s => `<option>${s.name}</option>`).join('')}</select></div>
                </div>
            </form>
        `);
        document.getElementById('compForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            const student = students.find(s => s.id === data.studentId);
            complaints = storage.get('complaints') || [];
            const newComp = {
                id: AppCommon.generateId('CMP', complaints), ...data,
                studentName: student ? `${student.firstName} ${student.lastName}` : '',
                roomNumber: student ? student.roomNumber : 'N/A',
                status: 'pending', createdAt: new Date().toISOString().split('T')[0], resolvedAt: null,
                timeline: [{ date: new Date().toISOString().split('T')[0], action: 'Complaint registered', by: student ? student.firstName : 'Student' }]
            };
            if (data.assignedTo) {
                newComp.timeline.push({ date: new Date().toISOString().split('T')[0], action: `Assigned to ${data.assignedTo}`, by: 'Admin' });
            }
            complaints.push(newComp);
            storage.set('complaints', complaints);
            AppCommon.closeModal();
            AppCommon.toast('Complaint submitted', 'success');
            renderStats(); render();
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterCategory', 'filterPriority', 'filterStatus'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    document.querySelectorAll('#complaintsTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });

    renderStats();
    render();
});