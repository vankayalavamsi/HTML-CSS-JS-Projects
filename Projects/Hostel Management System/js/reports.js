/* Hostel-Management-System/js/reports.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    const students = storage.get('students') || [];
    const rooms = storage.get('rooms') || [];
    const fees = storage.get('fees') || [];
    const attendance = storage.get('attendance') || [];
    const complaints = storage.get('complaints') || [];
    const visitors = storage.get('visitors') || [];
    const staff = storage.get('staff') || [];

    let currentReport = 'student';
    let chartInstances = [];

    const destroyCharts = () => { chartInstances.forEach(c => c.destroy()); chartInstances = []; };

    const generateReport = (type) => {
        currentReport = type;
        destroyCharts();
        const statsDiv = document.getElementById('reportStats');
        const chartsDiv = document.getElementById('reportCharts');
        const head = document.getElementById('reportHead');
        const body = document.getElementById('reportBody');
        const title = document.getElementById('reportTitle');

        let stats = [], columns = [], data = [], chartHtml = '';

        switch (type) {
            case 'student':
                title.textContent = 'Student Report';
                const activeSt = students.filter(s => s.status === 'active').length;
                const assigned = students.filter(s => s.roomId).length;
                stats = [
                    { label: 'Total Students', value: students.length, icon: 'fas fa-user-graduate', color: 'indigo' },
                    { label: 'Active', value: activeSt, icon: 'fas fa-check-circle', color: 'green' },
                    { label: 'Room Assigned', value: assigned, icon: 'fas fa-bed', color: 'blue' },
                    { label: 'Unassigned', value: students.length - assigned, icon: 'fas fa-exclamation-circle', color: 'yellow' }
                ];
                columns = ['ID', 'Name', 'Branch', 'Year', 'Room', 'Status'];
                data = students.map(s => ({ ID: s.id, Name: `${s.firstName} ${s.lastName}`, Branch: s.branch, Year: s.year, Room: s.roomNumber || 'N/A', Status: s.status }));
                const branches = [...new Set(students.map(s => s.branch))];
                const branchCounts = branches.map(b => students.filter(s => s.branch === b).length);
                chartHtml = `<div class="chart-card"><div class="chart-header"><h3>Students by Branch</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"><div class="chart-header"><h3>Students by Year</h3></div><canvas id="rChart2" style="max-height:260px;"></canvas></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'bar', data: { labels: branches, datasets: [{ label: 'Students', data: branchCounts, backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } } }));
                        const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
                        const yearCounts = years.map(y => students.filter(s => s.year === y).length);
                        chartInstances.push(new Chart(document.getElementById('rChart2'), { type: 'doughnut', data: { labels: years, datasets: [{ data: yearCounts, backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }, cutout: '60%' } }));
                    }
                }, 100);
                break;

            case 'fee':
                title.textContent = 'Fee Report';
                const paid = fees.filter(f => f.status === 'paid');
                const pending = fees.filter(f => f.status === 'pending');
                stats = [
                    { label: 'Total Records', value: fees.length, icon: 'fas fa-file-invoice', color: 'indigo' },
                    { label: 'Collected', value: AppCommon.formatCurrency(paid.reduce((a, f) => a + f.amount, 0)), icon: 'fas fa-money-bill-wave', color: 'green' },
                    { label: 'Pending', value: AppCommon.formatCurrency(pending.reduce((a, f) => a + f.amount, 0)), icon: 'fas fa-clock', color: 'red' },
                    { label: 'Collection %', value: fees.length > 0 ? Math.round((paid.length / fees.length) * 100) + '%' : '0%', icon: 'fas fa-chart-pie', color: 'blue' }
                ];
                columns = ['ID', 'Student', 'Type', 'Amount', 'Month', 'Status'];
                data = fees.map(f => ({ ID: f.id, Student: f.studentName, Type: f.type, Amount: AppCommon.formatCurrency(f.amount), Month: `${f.month} ${f.year}`, Status: f.status }));
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                chartHtml = `<div class="chart-card"><div class="chart-header"><h3>Monthly Collection</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"><div class="chart-header"><h3>Fee Types</h3></div><canvas id="rChart2" style="max-height:260px;"></canvas></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'line', data: { labels: months, datasets: [{ label: 'Collected', data: months.map(m => paid.filter(f => f.month === m).reduce((a, f) => a + f.amount, 0)), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } } }));
                        const types = [...new Set(fees.map(f => f.type))];
                        chartInstances.push(new Chart(document.getElementById('rChart2'), { type: 'pie', data: { labels: types, datasets: [{ data: types.map(t => fees.filter(f => f.type === t).reduce((a, f) => a + f.amount, 0)), backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } } }));
                    }
                }, 100);
                break;

            case 'attendance':
                title.textContent = 'Attendance Report';
                const present = attendance.filter(a => a.status === 'present').length;
                const absent = attendance.filter(a => a.status === 'absent').length;
                const leave = attendance.filter(a => a.status === 'leave').length;
                stats = [
                    { label: 'Total Records', value: attendance.length, icon: 'fas fa-clipboard-list', color: 'indigo' },
                    { label: 'Present', value: present, icon: 'fas fa-check-circle', color: 'green' },
                    { label: 'Absent', value: absent, icon: 'fas fa-times-circle', color: 'red' },
                    { label: 'Attendance %', value: attendance.length > 0 ? Math.round((present / attendance.length) * 100) + '%' : '0%', icon: 'fas fa-percentage', color: 'blue' }
                ];
                columns = ['Student', 'Room', 'Date', 'Status', 'Check In', 'Check Out'];
                data = attendance.map(a => ({ Student: a.studentName, Room: a.roomNumber, Date: AppCommon.formatDate(a.date), Status: a.status, 'Check In': a.checkIn || 'N/A', 'Check Out': a.checkOut || 'N/A' }));
                chartHtml = `<div class="chart-card" style="max-width:400px;margin:0 auto;"><div class="chart-header"><h3>Attendance Distribution</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'doughnut', data: { labels: ['Present', 'Absent', 'Leave'], datasets: [{ data: [present, absent, leave], backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }, cutout: '60%' } }));
                    }
                }, 100);
                break;

            case 'room':
                title.textContent = 'Room Report';
                const avail = rooms.filter(r => r.status === 'available').length;
                const occ = rooms.filter(r => r.status === 'occupied').length;
                const maint = rooms.filter(r => r.status === 'maintenance').length;
                stats = [
                    { label: 'Total Rooms', value: rooms.length, icon: 'fas fa-door-open', color: 'indigo' },
                    { label: 'Available', value: avail, icon: 'fas fa-check-circle', color: 'green' },
                    { label: 'Occupied', value: occ, icon: 'fas fa-users', color: 'blue' },
                    { label: 'Maintenance', value: maint, icon: 'fas fa-tools', color: 'red' }
                ];
                columns = ['ID', 'Block', 'Floor', 'Room No', 'Capacity', 'Occupants', 'Status'];
                data = rooms.map(r => ({ ID: r.id, Block: r.block, Floor: r.floor, 'Room No': r.number, Capacity: r.capacity, Occupants: `${r.occupants.length}/${r.capacity}`, Status: r.status }));
                chartHtml = `<div class="chart-card" style="max-width:400px;margin:0 auto;"><div class="chart-header"><h3>Room Status</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'doughnut', data: { labels: ['Available', 'Occupied', 'Maintenance'], datasets: [{ data: [avail, occ, maint], backgroundColor: ['#22c55e', '#6366f1', '#f59e0b'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }, cutout: '60%' } }));
                    }
                }, 100);
                break;

            case 'complaint':
                title.textContent = 'Complaint Report';
                const compPending = complaints.filter(c => c.status === 'pending').length;
                const compResolved = complaints.filter(c => c.status === 'resolved').length;
                stats = [
                    { label: 'Total Complaints', value: complaints.length, icon: 'fas fa-exclamation-circle', color: 'indigo' },
                    { label: 'Pending', value: compPending, icon: 'fas fa-clock', color: 'yellow' },
                    { label: 'Resolved', value: compResolved, icon: 'fas fa-check-circle', color: 'green' },
                    { label: 'Resolution %', value: complaints.length > 0 ? Math.round((compResolved / complaints.length) * 100) + '%' : '0%', icon: 'fas fa-chart-pie', color: 'blue' }
                ];
                columns = ['ID', 'Student', 'Category', 'Priority', 'Status', 'Assigned To'];
                data = complaints.map(c => ({ ID: c.id, Student: c.studentName, Category: c.category, Priority: c.priority, Status: c.status, 'Assigned To': c.assignedTo || 'N/A' }));
                const cats = [...new Set(complaints.map(c => c.category))];
                chartHtml = `<div class="chart-card"><div class="chart-header"><h3>By Category</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"><div class="chart-header"><h3>By Status</h3></div><canvas id="rChart2" style="max-height:260px;"></canvas></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'bar', data: { labels: cats, datasets: [{ label: 'Count', data: cats.map(c => complaints.filter(cm => cm.category === c).length), backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, y: { grid: { display: false } } } } }));
                        const statuses = ['pending', 'in-progress', 'resolved', 'closed'];
                        chartInstances.push(new Chart(document.getElementById('rChart2'), { type: 'pie', data: { labels: ['Pending', 'In Progress', 'Resolved', 'Closed'], datasets: [{ data: statuses.map(s => complaints.filter(c => c.status === s).length), backgroundColor: ['#f59e0b', '#06b6d4', '#22c55e', '#64748b'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } } }));
                    }
                }, 100);
                break;

            case 'visitor':
                title.textContent = 'Visitor Report';
                const inVisitors = visitors.filter(v => v.status === 'in').length;
                stats = [
                    { label: 'Total Visitors', value: visitors.length, icon: 'fas fa-id-card', color: 'indigo' },
                    { label: 'Currently Inside', value: inVisitors, icon: 'fas fa-sign-in-alt', color: 'green' },
                    { label: 'Checked Out', value: visitors.length - inVisitors, icon: 'fas fa-sign-out-alt', color: 'blue' },
                    { label: 'Today', value: visitors.filter(v => new Date(v.inTime).toDateString() === new Date().toDateString()).length, icon: 'fas fa-calendar-day', color: 'yellow' }
                ];
                columns = ['ID', 'Name', 'Phone', 'Visiting', 'Purpose', 'Status'];
                data = visitors.map(v => ({ ID: v.id, Name: v.name, Phone: v.phone, Visiting: v.studentName, Purpose: v.purpose, Status: v.status === 'in' ? 'Inside' : 'Out' }));
                const purposes = [...new Set(visitors.map(v => v.purpose))];
                chartHtml = `<div class="chart-card" style="max-width:400px;margin:0 auto;"><div class="chart-header"><h3>By Purpose</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'doughnut', data: { labels: purposes, datasets: [{ data: purposes.map(p => visitors.filter(v => v.purpose === p).length), backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }, cutout: '60%' } }));
                    }
                }, 100);
                break;

            case 'staff':
                title.textContent = 'Staff Report';
                const activeStaff = staff.filter(s => s.status === 'active').length;
                stats = [
                    { label: 'Total Staff', value: staff.length, icon: 'fas fa-user-tie', color: 'indigo' },
                    { label: 'Active', value: activeStaff, icon: 'fas fa-check-circle', color: 'green' },
                    { label: 'Inactive', value: staff.length - activeStaff, icon: 'fas fa-times-circle', color: 'red' },
                    { label: 'Total Salary', value: AppCommon.formatCurrency(staff.reduce((a, s) => a + s.salary, 0)), icon: 'fas fa-money-bill', color: 'blue' }
                ];
                columns = ['ID', 'Name', 'Role', 'Department', 'Salary', 'Status'];
                data = staff.map(s => ({ ID: s.id, Name: s.name, Role: s.role, Department: s.department, Salary: AppCommon.formatCurrency(s.salary), Status: s.status }));
                const depts = [...new Set(staff.map(s => s.department))];
                chartHtml = `<div class="chart-card"><div class="chart-header"><h3>By Department</h3></div><canvas id="rChart1" style="max-height:260px;"></canvas></div>
                <div class="chart-card"></div>`;
                setTimeout(() => {
                    if (typeof Chart !== 'undefined') {
                        chartInstances.push(new Chart(document.getElementById('rChart1'), { type: 'bar', data: { labels: depts, datasets: [{ label: 'Staff', data: depts.map(d => staff.filter(s => s.department === d).length), backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false }, ticks: { maxRotation: 45 } } } } }));
                    }
                }, 100);
                break;
        }

        statsDiv.innerHTML = stats.map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');
        chartsDiv.innerHTML = chartHtml;
        head.innerHTML = '<tr>' + columns.map(c => `<th>${c}</th>`).join('') + '</tr>';
        body.innerHTML = data.length > 0 ? data.map(row => '<tr>' + columns.map(c => `<td>${row[c] || ''}</td>`).join('') + '</tr>').join('') : '<tr><td colspan="' + columns.length + '" class="table-empty"><i class="fas fa-chart-bar"></i>No data available</td></tr>';
    };

    document.getElementById('genReportBtn').addEventListener('click', () => generateReport(document.getElementById('reportType').value));
    document.getElementById('reportType').addEventListener('change', (e) => generateReport(e.target.value));

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const table = document.getElementById('reportTable');
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
            const obj = {};
            Array.from(tr.querySelectorAll('td')).forEach((td, i) => { obj[headers[i]] = td.textContent; });
            return obj;
        });
        AppCommon.exportToExcel(rows, `${currentReport}_Report`);
    });

    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const table = document.getElementById('reportTable');
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
            const obj = {};
            Array.from(tr.querySelectorAll('td')).forEach((td, i) => { obj[headers[i]] = td.textContent; });
            return obj;
        });
        AppCommon.exportToPdf(`${currentReport.charAt(0).toUpperCase() + currentReport.slice(1)} Report`, headers, rows, `${currentReport}_Report`);
    });

    document.getElementById('printBtn').addEventListener('click', () => AppCommon.printTable(`${currentReport.charAt(0).toUpperCase() + currentReport.slice(1)} Report`, 'reportTable'));

    generateReport('student');
});