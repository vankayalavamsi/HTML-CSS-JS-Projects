/* Hostel-Management-System/js/warden.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    const students = storage.get('students') || [];
    const rooms = storage.get('rooms') || [];
    const complaints = storage.get('complaints') || [];
    const visitors = storage.get('visitors') || [];
    const attendance = storage.get('attendance') || [];
    const fees = storage.get('fees') || [];
    const staff = storage.get('staff') || [];

    const totalBeds = rooms.reduce((a, r) => a + r.capacity, 0);
    const usedBeds = rooms.reduce((a, r) => a + r.occupants.length, 0);
    const occPct = totalBeds > 0 ? Math.round((usedBeds / totalBeds) * 100) : 0;
    const todayVisitors = visitors.filter(v => v.status === 'in').length;
    const pendingComps = complaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length;
    const presentToday = attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length;
    const pendingFees = fees.filter(f => f.status === 'pending').reduce((a, f) => a + f.amount, 0);

    document.getElementById('wardenStats').innerHTML = [
        { label: 'Total Students', value: students.length, icon: 'fas fa-user-graduate', color: 'indigo' },
        { label: 'Occupancy Rate', value: occPct + '%', icon: 'fas fa-bed', color: 'blue' },
        { label: 'Pending Complaints', value: pendingComps, icon: 'fas fa-exclamation-circle', color: 'red' },
        { label: 'Visitors Inside', value: todayVisitors, icon: 'fas fa-id-card', color: 'yellow' },
        { label: 'Present Today', value: presentToday, icon: 'fas fa-user-check', color: 'green' },
        { label: 'Pending Fees', value: AppCommon.formatCurrency(pendingFees), icon: 'fas fa-money-bill', color: 'cyan' }
    ].map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');

    if (typeof Chart !== 'undefined') {
        const blocks = ['Block A', 'Block B', 'Block C', 'Block D'];
        const blockOcc = blocks.map(b => {
            const blockRooms = rooms.filter(r => r.block === b);
            const total = blockRooms.reduce((a, r) => a + r.capacity, 0);
            const used = blockRooms.reduce((a, r) => a + r.occupants.length, 0);
            return total > 0 ? Math.round((used / total) * 100) : 0;
        });
        new Chart(document.getElementById('blockChart'), {
            type: 'bar',
            data: { labels: blocks, datasets: [{ label: 'Occupancy %', data: blockOcc, backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(14,165,233,0.8)', 'rgba(34,197,94,0.8)', 'rgba(245,158,11,0.8)'], borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }
        });

        const compStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
        const compCounts = compStatuses.map(s => complaints.filter(c => c.status === s).length);
        new Chart(document.getElementById('compStatusChart'), {
            type: 'doughnut',
            data: { labels: ['Pending', 'In Progress', 'Resolved', 'Closed'], datasets: [{ data: compCounts, backgroundColor: ['#f59e0b', '#06b6d4', '#22c55e', '#64748b'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }, cutout: '60%' }
        });
    }

    const recentComps = complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const prioMap = { 'Low': 'secondary', 'Medium': 'info', 'High': 'danger', 'Critical': 'danger' };
    const statusMap = { 'pending': 'warning', 'in-progress': 'info', 'resolved': 'success', 'closed': 'secondary' };
    document.getElementById('recentCompBody').innerHTML = recentComps.map(c => `<tr>
        <td class="font-semibold">${c.id}</td>
        <td>${c.studentName}</td>
        <td>${c.category}</td>
        <td><span class="badge badge-${prioMap[c.priority] || 'secondary'}">${c.priority}</span></td>
        <td><span class="badge badge-${statusMap[c.status] || 'secondary'} badge-dot">${c.status}</span></td>
    </tr>`).join('');
});