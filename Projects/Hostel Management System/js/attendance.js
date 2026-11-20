/* Hostel-Management-System/js/attendance.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let attendance = storage.get('attendance') || [];
    let students = storage.get('students') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'date';
    let sortDir = 'desc';

    const renderStats = () => {
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const leave = attendance.filter(a => a.status === 'leave').length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;

        document.getElementById('attStats').innerHTML = [
            { label: 'Total Records', value: total, icon: 'fas fa-clipboard-list', color: 'indigo' },
            { label: 'Present', value: present, icon: 'fas fa-check-circle', color: 'green' },
            { label: 'Absent', value: absent, icon: 'fas fa-times-circle', color: 'red' },
            { label: 'On Leave', value: leave, icon: 'fas fa-plane', color: 'yellow' },
            { label: 'Attendance %', value: pct + '%', icon: 'fas fa-percentage', color: 'blue' },
            { label: 'Today Present', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length, icon: 'fas fa-user-check', color: 'cyan' }
        ].map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');
    };

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const date = document.getElementById('filterDate').value;
        const status = document.getElementById('filterStatus').value;
        const branch = document.getElementById('filterBranch').value;
        return attendance.filter(a => {
            const name = (a.studentName || '').toLowerCase();
            const matchSearch = !search || name.includes(search);
            const matchDate = !date || a.date === date;
            const matchStatus = !status || a.status === status;
            const student = students.find(s => s.id === a.studentId);
            const matchBranch = !branch || (student && student.branch === branch);
            return matchSearch && matchDate && matchStatus && matchBranch;
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

        const tbody = document.getElementById('attBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="table-empty"><i class="fas fa-clipboard-check"></i>No attendance records found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(a => {
                const statusBadge = a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning';
                return `<tr>
                    <td><div class="cell-flex"><div class="table-avatar">${a.studentName ? a.studentName.charAt(0) : '?'}</div><div class="cell-flex-info"><span class="name">${a.studentName || 'Unknown'}</span><span class="sub">${a.studentId}</span></div></div></td>
                    <td>${a.roomNumber || 'N/A'}</td>
                    <td>${AppCommon.formatDate(a.date)}</td>
                    <td><span class="badge badge-${statusBadge} badge-dot">${a.status}</span></td>
                    <td>${a.checkIn || 'N/A'}</td>
                    <td>${a.checkOut || 'N/A'}</td>
                    <td><div class="table-actions">
                        <button class="btn-icon" title="Edit" onclick="AttPage.edit('${a.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="Delete" onclick="AttPage.delete('${a.id}')"><i class="fas fa-trash"></i></button>
                    </div></td>
                </tr>`;
            }).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="AttPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="AttPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="AttPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    const renderCalendar = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

        let html = `<h3 style="text-align:center;margin-bottom:16px;">${monthNames[month]} ${year}</h3>`;
        html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">';
        dayNames.forEach(d => { html += `<div style="text-align:center;font-weight:600;font-size:12px;padding:8px;color:var(--text-secondary);">${d}</div>`; });
        
        for (let i = 0; i < firstDay; i++) html += '<div></div>';
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayAtt = attendance.filter(a => a.date === dateStr);
            const present = dayAtt.filter(a => a.status === 'present').length;
            const absent = dayAtt.filter(a => a.status === 'absent').length;
            const isToday = d === now.getDate();
            const bg = isToday ? 'var(--primary)' : (dayAtt.length > 0 ? 'var(--light)' : 'transparent');
            const color = isToday ? 'white' : 'var(--text)';
            
            html += `<div style="text-align:center;padding:8px;border-radius:8px;background:${bg};color:${color};font-size:13px;min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <strong>${d}</strong>
                ${dayAtt.length > 0 ? `<div style="font-size:10px;margin-top:2px;">${isToday ? '' : `<span style="color:var(--success);">✓${present}</span> <span style="color:var(--danger);">✗${absent}</span>`}</div>` : ''}
            </div>`;
        }
        html += '</div>';
        document.getElementById('calendarView').innerHTML = html;
    };

    window.AttPage = {
        goPage(p) { currentPage = p; render(); },
        edit(id) {
            const a = attendance.find(at => at.id === id);
            if (!a) return;
            AppCommon.openModal('Edit Attendance', `
                <form id="attForm">
                    <div class="form-row-2">
                        <div class="form-group"><label>Date</label><input type="date" class="form-control" name="date" value="${a.date}"></div>
                        <div class="form-group"><label>Status</label><select class="form-control" name="status"><option value="present" ${a.status === 'present' ? 'selected' : ''}>Present</option><option value="absent" ${a.status === 'absent' ? 'selected' : ''}>Absent</option><option value="leave" ${a.status === 'leave' ? 'selected' : ''}>Leave</option></select></div>
                    </div>
                    <div class="form-row-2">
                        <div class="form-group"><label>Check In</label><input type="time" class="form-control" name="checkIn" value="${a.checkIn || ''}"></div>
                        <div class="form-group"><label>Check Out</label><input type="time" class="form-control" name="checkOut" value="${a.checkOut || ''}"></div>
                    </div>
                    <input type="hidden" name="id" value="${a.id}">
                </form>
            `);
            document.getElementById('attForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.target).entries());
                attendance = storage.get('attendance') || [];
                const idx = attendance.findIndex(at => at.id === data.id);
                if (idx > -1) { attendance[idx] = { ...attendance[idx], ...data }; storage.set('attendance', attendance); AppCommon.closeModal(); AppCommon.toast('Attendance updated', 'success'); renderStats(); render(); }
            });
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Record', 'Delete this attendance record?')) return;
            attendance = storage.get('attendance') || [];
            attendance = attendance.filter(a => a.id !== id);
            storage.set('attendance', attendance);
            AppCommon.toast('Record deleted', 'success');
            renderStats(); render();
        }
    };

    document.getElementById('markAttBtn').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const existing = attendance.filter(a => a.date === today).map(a => a.studentId);
        const list = students.filter(s => s.status === 'active' && !existing.includes(s.id)).slice(0, 50);
        
        AppCommon.openModal('Mark Attendance - ' + AppCommon.formatDate(today), `
            <form id="markAttForm">
                <p class="text-sm text-gray mb-3">${list.length > 0 ? `Marking attendance for ${list.length} students` : 'All students already marked for today'}</p>
                <div style="max-height:400px;overflow-y:auto;">
                    <table class="data-table">
                        <thead><tr><th>Student</th><th>Room</th><th>Present</th><th>Absent</th><th>Leave</th></tr></thead>
                        <tbody>${list.map(s => `
                            <tr>
                                <td><strong>${s.firstName} ${s.lastName}</strong><br><span class="text-xs text-gray">${s.id}</span></td>
                                <td>${s.roomNumber || 'N/A'}</td>
                                <td style="text-align:center;"><input type="radio" name="att_${s.id}" value="present" checked></td>
                                <td style="text-align:center;"><input type="radio" name="att_${s.id}" value="absent"></td>
                                <td style="text-align:center;"><input type="radio" name="att_${s.id}" value="leave"></td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>
            </form>
        `, 'lg');

        document.getElementById('markAttForm').addEventListener('submit', (e) => {
            e.preventDefault();
            attendance = storage.get('attendance') || [];
            const fd = new FormData(e.target);
            list.forEach(s => {
                const status = fd.get('att_' + s.id) || 'present';
                attendance.push({
                    id: AppCommon.generateId('ATT', attendance, 4),
                    studentId: s.id, studentName: `${s.firstName} ${s.lastName}`,
                    roomNumber: s.roomNumber || 'N/A', date: today, status: status,
                    checkIn: status !== 'absent' ? `${String(9 + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
                    checkOut: null
                });
            });
            storage.set('attendance', attendance);
            AppCommon.closeModal();
            AppCommon.toast('Attendance marked successfully', 'success');
            renderStats(); render();
        });
    });

    // Tabs
    document.querySelectorAll('#attTabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#attTabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
            if (btn.dataset.tab === 'calendar') renderCalendar();
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterDate', 'filterStatus', 'filterBranch'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });
    document.querySelectorAll('#attTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const data = getFiltered().map(a => ({ ID: a.studentId, Student: a.studentName, Room: a.roomNumber, Date: a.date, Status: a.status, 'Check In': a.checkIn || 'N/A', 'Check Out': a.checkOut || 'N/A' }));
        AppCommon.exportToExcel(data, 'Attendance_Report');
    });
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const data = getFiltered().map(a => ({ Student: a.studentName, Room: a.roomNumber, Date: AppCommon.formatDate(a.date), Status: a.status, 'Check In': a.checkIn || 'N/A', 'Check Out': a.checkOut || 'N/A' }));
        AppCommon.exportToPdf('Attendance Report', ['Student', 'Room', 'Date', 'Status', 'Check In', 'Check Out'], data, 'Attendance_Report');
    });

    renderStats();
    render();
});