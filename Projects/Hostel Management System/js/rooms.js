/* Hostel-Management-System/js/rooms.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let rooms = storage.get('rooms') || [];
    let students = storage.get('students') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'number';
    let sortDir = 'asc';
    let isCardView = false;
    let tabFilter = 'all';

    const renderStats = () => {
        const total = rooms.length;
        const avail = rooms.filter(r => r.status === 'available').length;
        const occ = rooms.filter(r => r.status === 'occupied').length;
        const maint = rooms.filter(r => r.status === 'maintenance').length;
        const totalBeds = rooms.reduce((a, r) => a + r.capacity, 0);
        const usedBeds = rooms.reduce((a, r) => a + r.occupants.length, 0);
        const occPct = totalBeds > 0 ? Math.round((usedBeds / totalBeds) * 100) : 0;

        document.getElementById('roomStats').innerHTML = [
            { label: 'Total Rooms', value: total, icon: 'fas fa-door-open', color: 'indigo' },
            { label: 'Available', value: avail, icon: 'fas fa-check-circle', color: 'green' },
            { label: 'Occupied', value: occ, icon: 'fas fa-users', color: 'blue' },
            { label: 'Maintenance', value: maint, icon: 'fas fa-tools', color: 'red' },
            { label: 'Total Beds', value: totalBeds, icon: 'fas fa-bed', color: 'cyan' },
            { label: 'Occupancy', value: occPct + '%', icon: 'fas fa-chart-pie', color: 'yellow' }
        ].map(s => `<div class="stat-card ${s.color}"><div class="stat-icon ${s.color}"><i class="${s.icon}"></i></div><div class="stat-info"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div></div></div>`).join('');
    };

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const block = document.getElementById('filterBlock').value;
        const floor = document.getElementById('filterFloor').value;
        const status = document.getElementById('filterStatus').value;

        return rooms.filter(r => {
            const matchSearch = !search || r.number.toLowerCase().includes(search) || r.id.toLowerCase().includes(search) || r.block.toLowerCase().includes(search);
            const matchBlock = !block || r.block === block;
            const matchFloor = !floor || r.floor === parseInt(floor);
            let matchStatus = !status || r.status === status;
            if (tabFilter !== 'all') matchStatus = r.status === tabFilter;
            return matchSearch && matchBlock && matchFloor && matchStatus;
        });
    };

    const getSorted = (data) => [...data].sort((a, b) => {
        let valA = a[sortCol], valB = b[sortCol];
        if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const getOccupantNames = (occupantIds) => {
        return occupantIds.map(id => {
            const s = students.find(st => st.id === id);
            return s ? `${s.firstName} ${s.lastName}` : id;
        });
    };

    const renderTable = () => {
        const filtered = getFiltered();
        const sorted = getSorted(filtered);
        const total = sorted.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * perPage;
        const pageData = sorted.slice(start, start + perPage);

        const tbody = document.getElementById('roomsBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><i class="fas fa-bed"></i>No rooms found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(r => {
                const pct = Math.round((r.occupants.length / r.capacity) * 100);
                const names = getOccupantNames(r.occupants);
                const statusBadge = r.status === 'occupied' ? 'danger' : r.status === 'available' ? 'success' : 'warning';
                return `<tr>
                    <td class="font-semibold">${r.id}</td>
                    <td>${r.block}</td>
                    <td>${r.floor}</td>
                    <td class="font-semibold">${r.number}</td>
                    <td>${r.capacity}</td>
                    <td><div style="max-width:150px;">${names.length > 0 ? names.map(n => `<span class="text-xs">${n}</span>`).join(', ') : '<span class="text-gray text-xs">Empty</span>'}</div></td>
                    <td><div class="progress-bar" style="width:80px;"><div class="progress-fill ${pct >= 100 ? 'red' : pct >= 50 ? 'yellow' : 'green'}" style="width:${pct}%"></div></div><span class="text-xs">${r.occupants.length}/${r.capacity}</span></td>
                    <td><span class="badge badge-${statusBadge} badge-dot">${r.status}</span></td>
                    <td><div class="table-actions">
                        <button class="btn-icon" title="Assign Student" onclick="RoomPage.assign('${r.id}')"><i class="fas fa-user-plus"></i></button>
                        <button class="btn-icon" title="Edit" onclick="RoomPage.edit('${r.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="Toggle Maintenance" onclick="RoomPage.toggleMaint('${r.id}')"><i class="fas fa-tools"></i></button>
                    </div></td>
                </tr>`;
            }).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="RoomPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="RoomPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="RoomPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    const renderCards = () => {
        const search = (document.getElementById('cardSearchInput') ? document.getElementById('cardSearchInput').value : '').toLowerCase();
        const block = (document.getElementById('cardFilterBlock') ? document.getElementById('cardFilterBlock').value : '');
        const filtered = rooms.filter(r => {
            const matchSearch = !search || r.number.toLowerCase().includes(search);
            const matchBlock = !block || r.block === block;
            let matchStatus = tabFilter === 'all' || r.status === tabFilter;
            return matchSearch && matchBlock && matchStatus;
        });

        document.getElementById('roomCardsGrid').innerHTML = filtered.map(r => {
            const pct = Math.round((r.occupants.length / r.capacity) * 100);
            const statusColor = r.status === 'occupied' ? 'var(--danger)' : r.status === 'available' ? 'var(--success)' : 'var(--warning)';
            const names = getOccupantNames(r.occupants);
            return `<div class="card" style="border-left:4px solid ${statusColor};">
                <div class="card-body">
                    <div class="d-flex justify-between align-center mb-2">
                        <h3 class="font-bold" style="font-size:18px;">${r.number}</h3>
                        <span class="badge badge-${r.status === 'occupied' ? 'danger' : r.status === 'available' ? 'success' : 'warning'} badge-dot">${r.status}</span>
                    </div>
                    <p class="text-sm text-gray">${r.block} - Floor ${r.floor}</p>
                    <div class="mt-2 mb-2">
                        <div class="d-flex justify-between text-xs mb-1"><span>Occupancy</span><span class="font-semibold">${r.occupants.length}/${r.capacity}</span></div>
                        <div class="progress-bar"><div class="progress-fill ${pct >= 100 ? 'red' : pct >= 50 ? 'yellow' : 'green'}" style="width:${pct}%"></div></div>
                    </div>
                    <div class="mt-2 text-xs">${names.length > 0 ? names.join(', ') : '<span class="text-gray">No occupants</span>'}</div>
                    <div class="mt-3 btn-group">
                        <button class="btn btn-sm btn-outline" onclick="RoomPage.assign('${r.id}')"><i class="fas fa-user-plus"></i> Assign</button>
                        <button class="btn btn-sm btn-secondary" onclick="RoomPage.edit('${r.id}')"><i class="fas fa-edit"></i></button>
                    </div>
                </div>
            </div>`;
        }).join('');
    };

    window.RoomPage = {
        goPage(p) { currentPage = p; renderTable(); },
        edit(id) {
            const r = rooms.find(rm => rm.id === id);
            if (!r) return;
            AppCommon.openModal('Edit Room', `
                <form id="roomForm">
                    <div class="form-row-2">
                        <div class="form-group"><label>Block</label><select class="form-control" name="block">${['Block A','Block B','Block C','Block D'].map(b => `<option ${r.block === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
                        <div class="form-group"><label>Floor</label><select class="form-control" name="floor">${[1,2,3].map(f => `<option value="${f}" ${r.floor === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
                    </div>
                    <div class="form-row-2">
                        <div class="form-group"><label>Room Number</label><input type="text" class="form-control" name="number" value="${r.number}"></div>
                        <div class="form-group"><label>Capacity</label><input type="number" class="form-control" name="capacity" value="${r.capacity}" min="1" max="8"></div>
                    </div>
                    <div class="form-group"><label>Status</label><select class="form-control" name="status"><option value="available" ${r.status === 'available' ? 'selected' : ''}>Available</option><option value="occupied" ${r.status === 'occupied' ? 'selected' : ''}>Occupied</option><option value="maintenance" ${r.status === 'maintenance' ? 'selected' : ''}>Maintenance</option></select></div>
                    <input type="hidden" name="id" value="${r.id}">
                </form>
            `);
            document.getElementById('roomForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const data = Object.fromEntries(fd.entries());
                data.floor = parseInt(data.floor);
                data.capacity = parseInt(data.capacity);
                const idx = rooms.findIndex(rm => rm.id === data.id);
                if (idx > -1) { rooms[idx] = { ...rooms[idx], ...data }; storage.set('rooms', rooms); AppCommon.closeModal(); AppCommon.toast('Room updated', 'success'); renderStats(); renderTable(); renderCards(); }
            });
        },
        assign(id) {
            const r = rooms.find(rm => rm.id === id);
            if (!r) return;
            const unassigned = students.filter(s => !s.roomId && s.status === 'active');
            AppCommon.openModal(`Assign Student to ${r.number}`, `
                <form id="assignForm">
                    <p class="text-sm text-gray mb-3">Capacity: ${r.occupants.length}/${r.capacity} | Block: ${r.block} | Floor: ${r.floor}</p>
                    <div class="form-group"><label>Select Student</label><select class="form-control" name="studentId"><option value="">Choose student...</option>${unassigned.map(s => `<option value="${s.id}">${s.id} - ${s.firstName} ${s.lastName} (${s.branch})</option>`).join('')}</select></div>
                    ${unassigned.length === 0 ? '<p class="text-danger text-sm">No unassigned students available.</p>' : ''}
                </form>
            `);
            document.getElementById('assignForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const studentId = e.target.studentId.value;
                if (!studentId) { AppCommon.toast('Select a student', 'warning'); return; }
                students = storage.get('students') || [];
                rooms = storage.get('rooms') || [];
                const sIdx = students.findIndex(s => s.id === studentId);
                const rIdx = rooms.findIndex(rm => rm.id === id);
                if (sIdx > -1 && rIdx > -1) {
                    students[sIdx].roomId = id;
                    students[sIdx].roomNumber = rooms[rIdx].number;
                    students[sIdx].block = rooms[rIdx].block;
                    rooms[rIdx].occupants.push(studentId);
                    if (rooms[rIdx].occupants.length >= rooms[rIdx].capacity) rooms[rIdx].status = 'occupied';
                    storage.set('students', students);
                    storage.set('rooms', rooms);
                    AppCommon.closeModal();
                    AppCommon.toast('Student assigned to room', 'success');
                    renderStats(); renderTable(); renderCards();
                }
            });
        },
        toggleMaint(id) {
            rooms = storage.get('rooms') || [];
            const idx = rooms.findIndex(r => r.id === id);
            if (idx > -1) {
                if (rooms[idx].status === 'maintenance') {
                    rooms[idx].status = rooms[idx].occupants.length > 0 ? 'occupied' : 'available';
                } else {
                    if (rooms[idx].occupants.length > 0) { AppCommon.toast('Cannot set to maintenance: Room has occupants', 'warning'); return; }
                    rooms[idx].status = 'maintenance';
                }
                storage.set('rooms', rooms);
                AppCommon.toast('Room status updated', 'success');
                renderStats(); renderTable(); renderCards();
            }
        }
    };

    document.getElementById('addRoomBtn').addEventListener('click', () => {
        AppCommon.openModal('Add Room', `
            <form id="roomForm">
                <div class="form-row-2">
                    <div class="form-group"><label>Block</label><select class="form-control" name="block">${['Block A','Block B','Block C','Block D'].map(b => `<option>${b}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Floor</label><select class="form-control" name="floor">${[1,2,3].map(f => `<option value="${f}">${f}</option>`).join('')}</select></div>
                </div>
                <div class="form-row-2">
                    <div class="form-group"><label>Room Number</label><input type="text" class="form-control" name="number" required></div>
                    <div class="form-group"><label>Capacity</label><input type="number" class="form-control" name="capacity" value="2" min="1" max="8" required></div>
                </div>
            </form>
        `);
        document.getElementById('roomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd.entries());
            data.floor = parseInt(data.floor);
            data.capacity = parseInt(data.capacity);
            rooms = storage.get('rooms') || [];
            rooms.push({ id: AppCommon.generateId('ROOM', rooms), ...data, occupants: [], status: 'available' });
            storage.set('rooms', rooms);
            AppCommon.closeModal();
            AppCommon.toast('Room added successfully', 'success');
            renderStats(); renderTable(); renderCards();
        });
    });

    document.getElementById('viewToggle').addEventListener('click', () => {
        isCardView = !isCardView;
        document.getElementById('tableView').style.display = isCardView ? 'none' : '';
        const cardView = document.getElementById('cardView');
        cardView.style.display = isCardView ? '' : 'none';
        cardView.classList.toggle('hidden', !isCardView);
        document.getElementById('viewToggle').innerHTML = isCardView ? '<i class="fas fa-list"></i> Table View' : '<i class="fas fa-th-large"></i> Card View';
        if (isCardView) renderCards();
    });

    document.querySelectorAll('#roomTabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#roomTabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabFilter = btn.dataset.view;
            currentPage = 1;
            renderTable();
            if (isCardView) renderCards();
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; renderTable(); }, 300));
    ['filterBlock', 'filterFloor', 'filterStatus'].forEach(id => document.getElementById(id).addEventListener('change', () => { currentPage = 1; renderTable(); }));
    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; renderTable(); });
    
    const cardSearch = document.getElementById('cardSearchInput');
    const cardBlock = document.getElementById('cardFilterBlock');
    if (cardSearch) cardSearch.addEventListener('input', AppCommon.debounce(renderCards, 300));
    if (cardBlock) cardBlock.addEventListener('change', renderCards);

    document.querySelectorAll('#roomsTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            renderTable();
        });
    });

    renderStats();
    renderTable();
});