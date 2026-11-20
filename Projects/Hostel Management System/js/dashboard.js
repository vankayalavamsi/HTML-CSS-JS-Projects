/* Hostel-Management-System/js/dashboard.js */
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
    const notices = storage.get('notices') || [];

    const totalStudents = students.length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const vacantBeds = rooms.reduce((acc, r) => acc + (r.capacity - r.occupants.length), 0);
    const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length;
    const todayVisitors = visitors.filter(v => {
        const d = new Date(v.inTime);
        const t = new Date();
        return d.toDateString() === t.toDateString();
    }).length;
    const feesCollected = fees.filter(f => f.status === 'paid').reduce((a, f) => a + f.amount, 0);
    const pendingFees = fees.filter(f => f.status === 'pending').reduce((a, f) => a + f.amount, 0);
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attPercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
    const staffCount = staff.length;
    const activeNotices = notices.filter(n => n.active).length;

    const stats = [
        { label: 'Total Students', value: totalStudents, icon: 'fas fa-user-graduate', color: 'indigo', change: '+5%', dir: 'up' },
        { label: 'Available Rooms', value: availableRooms, icon: 'fas fa-door-open', color: 'green', change: '+2', dir: 'up' },
        { label: 'Occupied Rooms', value: occupiedRooms, icon: 'fas fa-door-closed', color: 'blue', change: '-1', dir: 'down' },
        { label: 'Vacant Beds', value: vacantBeds, icon: 'fas fa-bed', color: 'cyan', change: '+8', dir: 'up' },
        { label: 'Pending Complaints', value: pendingComplaints, icon: 'fas fa-exclamation-circle', color: 'red', change: '-3', dir: 'down' },
        { label: 'Visitors Today', value: todayVisitors, icon: 'fas fa-id-card', color: 'yellow', change: '+2', dir: 'up' },
        { label: 'Fees Collected', value: AppCommon.formatCurrency(feesCollected), icon: 'fas fa-money-bill-wave', color: 'green', change: '+12%', dir: 'up' },
        { label: 'Pending Fees', value: AppCommon.formatCurrency(pendingFees), icon: 'fas fa-clock', color: 'red', change: '-5%', dir: 'down' },
        { label: 'Attendance %', value: attPercent + '%', icon: 'fas fa-clipboard-check', color: 'indigo', change: '+2%', dir: 'up' },
        { label: 'Staff Count', value: staffCount, icon: 'fas fa-user-tie', color: 'blue', change: '0', dir: 'up' },
        { label: 'Active Notices', value: activeNotices, icon: 'fas fa-bullhorn', color: 'yellow', change: '+1', dir: 'up' },
        { label: 'Monthly Income', value: AppCommon.formatCurrency(feesCollected), icon: 'fas fa-chart-line', color: 'green', change: '+8%', dir: 'up' }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(s => `
        <div class="stat-card ${s.color}">
            <div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div>
            <div class="stat-info">
                <div class="stat-label">${s.label}</div>
                <div class="stat-value">${s.value}</div>
                <div class="stat-change ${s.dir}"><i class="fas fa-arrow-${s.dir}"></i> ${s.change} from last month</div>
            </div>
        </div>
    `).join('');

    // Charts
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyFees = months.map((m, i) => fees.filter(f => f.month === m && f.status === 'paid').reduce((a, f) => a + f.amount, 0));
    const monthlyPending = months.map((m, i) => fees.filter(f => f.month === m && f.status === 'pending').reduce((a, f) => a + f.amount, 0));

    if (typeof Chart !== 'undefined') {
        new Chart(document.getElementById('feeChart'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    { label: 'Collected', data: monthlyFees, backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 6 },
                    { label: 'Pending', data: monthlyPending, backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 6 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
        });

        new Chart(document.getElementById('roomChart'), {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Available', 'Maintenance'],
                datasets: [{ data: [occupiedRooms, availableRooms, rooms.filter(r => r.status === 'maintenance').length], backgroundColor: ['#6366f1', '#22c55e', '#f59e0b'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, cutout: '65%' }
        });

        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const leave = attendance.filter(a => a.status === 'leave').length;
        new Chart(document.getElementById('attendanceChart'), {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Leave'],
                datasets: [{ data: [present, absent, leave], backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }
        });

        const high = complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length;
        const medium = complaints.filter(c => c.priority === 'Medium').length;
        const low = complaints.filter(c => c.priority === 'Low').length;
        new Chart(document.getElementById('complaintChart'), {
            type: 'polarArea',
            data: {
                labels: ['High/Critical', 'Medium', 'Low'],
                datasets: [{ data: [high, medium, low], backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(34,197,94,0.7)'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, scales: { r: { display: false } } }
        });
    }

    // Recent Activity
    const activities = [
        { dot: 'green', text: 'Fee payment of ₹5,000 received from Diya Patel', time: '10 mins ago' },
        { dot: 'blue', text: 'New student Reyansh Gupta admitted to Block B', time: '25 mins ago' },
        { dot: 'red', text: 'High priority complaint raised for Room A102', time: '1 hour ago' },
        { dot: 'yellow', text: 'Visitor Mr. Rajesh Kumar checked in', time: '2 hours ago' },
        { dot: 'purple', text: 'Notice posted: Water Supply Maintenance', time: '3 hours ago' },
        { dot: 'green', text: 'Complaint CMP012 resolved by maintenance team', time: '4 hours ago' },
        { dot: 'blue', text: 'Room C201 assigned to new student', time: '5 hours ago' },
        { dot: 'yellow', text: 'Mess menu updated for next week', time: '6 hours ago' }
    ];
    document.getElementById('activityList').innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-dot ${a.dot}"></div>
            <div class="activity-text"><p>${a.text}</p><span>${a.time}</span></div>
        </div>
    `).join('');

    // Quick Actions
    const actions = [
        { icon: 'fas fa-user-plus', label: 'Add Student', link: 'pages/students.html' },
        { icon: 'fas fa-bed', label: 'Manage Rooms', link: 'pages/rooms.html' },
        { icon: 'fas fa-money-bill', label: 'Collect Fee', link: 'pages/fees.html' },
        { icon: 'fas fa-clipboard-check', label: 'Mark Attendance', link: 'pages/attendance.html' },
        { icon: 'fas fa-exclamation-circle', label: 'Complaints', link: 'pages/complaints.html' },
        { icon: 'fas fa-bullhorn', label: 'Post Notice', link: 'pages/notices.html' },
        { icon: 'fas fa-chart-bar', label: 'Reports', link: 'pages/reports.html' },
        { icon: 'fas fa-cog', label: 'Settings', link: 'pages/settings.html' }
    ];
    document.getElementById('quickActions').innerHTML = actions.map(a => `
        <a href="${a.link}" class="quick-action-btn"><i class="${a.icon}"></i><span>${a.label}</span></a>
    `).join('');
});