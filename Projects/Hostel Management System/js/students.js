/* Hostel-Management-System/js/students.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let students = storage.get('students') || [];
    let rooms = storage.get('rooms') || [];
    let currentPage = 1;
    let perPage = 10;
    let sortCol = 'id';
    let sortDir = 'asc';

    const populateFilters = () => {
        const roomSelect = document.getElementById('filterRoom');
        const roomNums = [...new Set(students.filter(s => s.roomNumber).map(s => s.roomNumber))].sort();
        roomSelect.innerHTML = '<option value="">All Rooms</option>' + roomNums.map(r => `<option value="${r}">${r}</option>`).join('');
    };

    const getFiltered = () => {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const branch = document.getElementById('filterBranch').value;
        const year = document.getElementById('filterYear').value;
        const status = document.getElementById('filterStatus').value;
        const room = document.getElementById('filterRoom').value;

        return students.filter(s => {
            const name = `${s.firstName} ${s.lastName}`.toLowerCase();
            const matchSearch = !search || name.includes(search) || s.id.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.phone.includes(search);
            const matchBranch = !branch || s.branch === branch;
            const matchYear = !year || s.year === year;
            const matchStatus = !status || s.status === status;
            const matchRoom = !room || s.roomNumber === room;
            return matchSearch && matchBranch && matchYear && matchStatus && matchRoom;
        });
    };

    const getSorted = (data) => {
        return [...data].sort((a, b) => {
            let valA, valB;
            if (sortCol === 'name') { valA = `${a.firstName} ${a.lastName}`; valB = `${b.firstName} ${b.lastName}`; }
            else { valA = a[sortCol] || ''; valB = b[sortCol] || ''; }
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const render = () => {
        const filtered = getFiltered();
        const sorted = getSorted(filtered);
        const total = sorted.length;
        const totalPages = Math.max(1, Math.ceil(total / perPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * perPage;
        const pageData = sorted.slice(start, start + perPage);

        const tbody = document.getElementById('studentsBody');
        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><i class="fas fa-user-graduate"></i>No students found</td></tr>';
        } else {
            tbody.innerHTML = pageData.map(s => `
                <tr>
                    <td><input type="checkbox" class="row-checkbox" data-id="${s.id}"></td>
                    <td><span class="font-semibold">${s.id}</span></td>
                    <td>
                        <div class="cell-flex">
                            <div class="table-avatar">${s.photo ? `<img src="${s.photo}">` : s.firstName.charAt(0)}</div>
                            <div class="cell-flex-info">
                                <span class="name">${s.firstName} ${s.lastName}</span>
                                <span class="sub">${s.email}</span>
                            </div>
                        </div>
                    </td>
                    <td>${s.branch}</td>
                    <td>${s.year}</td>
                    <td>${s.roomNumber || '<span class="text-gray">Not Assigned</span>'}</td>
                    <td>${s.phone}</td>
                    <td><span class="badge badge-${s.status === 'active' ? 'success' : 'danger'} badge-dot">${s.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" title="View" onclick="StudentPage.view('${s.id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon" title="Edit" onclick="StudentPage.edit('${s.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" title="Delete" onclick="StudentPage.delete('${s.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        document.getElementById('pageInfo').textContent = `Showing ${start + 1}-${Math.min(start + perPage, total)} of ${total}`;
        
        const pagDiv = document.getElementById('pagination');
        let pagHtml = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="StudentPage.goPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="StudentPage.goPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                pagHtml += '<button disabled>...</button>';
            }
        }
        pagHtml += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="StudentPage.goPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
        pagDiv.innerHTML = pagHtml;
    };

    const getFormHtml = (s = null) => {
        const availRooms = rooms.filter(r => r.status !== 'maintenance' && r.occupants.length < r.capacity);
        return `
        <form id="studentForm">
            <div class="form-row-2">
                <div class="form-group"><label class="form-label-required">First Name</label><input type="text" class="form-control" name="firstName" value="${s ? s.firstName : ''}" required></div>
                <div class="form-group"><label class="form-label-required">Last Name</label><input type="text" class="form-control" name="lastName" value="${s ? s.lastName : ''}" required></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label class="form-label-required">Email</label><input type="email" class="form-control" name="email" value="${s ? s.email : ''}" required></div>
                <div class="form-group"><label class="form-label-required">Phone</label><input type="tel" class="form-control" name="phone" value="${s ? s.phone : ''}" required></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>DOB</label><input type="date" class="form-control" name="dob" value="${s ? s.dob : ''}"></div>
                <div class="form-group"><label class="form-label-required">Branch</label><select class="form-control" name="branch" required><option value="">Select</option>${['Computer Science','Electronics','Mechanical','Civil','Electrical','Information Technology','Chemical','Biotechnology','MBA','MCA'].map(b => `<option ${s && s.branch === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
                <div class="form-group"><label class="form-label-required">Year</label><select class="form-control" name="year" required><option value="">Select</option>${['1st Year','2nd Year','3rd Year','4th Year'].map(y => `<option ${s && s.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label>Room</label><select class="form-control" name="roomId"><option value="">None</option>${availRooms.map(r => `<option value="${r.id}" ${s && s.roomId === r.id ? 'selected' : ''}>${r.number} (${r.block} - Floor ${r.floor}) [${r.occupants.length}/${r.capacity}]</option>`).join('')}</select></div>
                <div class="form-group"><label>Blood Group</label><select class="form-control" name="bloodGroup"><option value="">Select</option>${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => `<option ${s && s.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}</select></div>
            </div>
            <div class="form-group"><label>Address</label><textarea class="form-control" name="address" rows="2">${s ? s.address : ''}</textarea></div>
            <div class="form-row-3">
                <div class="form-group"><label>City</label><input type="text" class="form-control" name="city" value="${s ? s.city : ''}"></div>
                <div class="form-group"><label>State</label><input type="text" class="form-control" name="state" value="${s ? s.state : ''}"></div>
                <div class="form-group"><label>Guardian Name</label><input type="text" class="form-control" name="guardianName" value="${s ? s.guardianName : ''}"></div>
            </div>
            <div class="form-row-2">
                <div class="form-group"><label>Guardian Phone</label><input type="tel" class="form-control" name="guardianPhone" value="${s ? s.guardianPhone : ''}"></div>
                <div class="form-group"><label>Photo</label><div class="file-upload"><input type="file" accept="image/*" name="photo"><i class="fas fa-cloud-upload-alt"></i><p>Click to upload photo</p></div></div>
            </div>
            <input type="hidden" name="id" value="${s ? s.id : ''}">
        </form>`;
    };

    const saveStudent = (e) => {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());
        
        if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.branch || !data.year) {
            AppCommon.toast('Please fill all required fields', 'warning');
            return;
        }

        students = storage.get('students') || [];
        rooms = storage.get('rooms') || [];

        if (data.id) {
            const idx = students.findIndex(s => s.id === data.id);
            if (idx > -1) {
                const oldRoomId = students[idx].roomId;
                if (oldRoomId && oldRoomId !== data.roomId) {
                    const oldRoom = rooms.find(r => r.id === oldRoomId);
                    if (oldRoom) {
                        oldRoom.occupants = oldRoom.occupants.filter(id => id !== data.id);
                        if (oldRoom.occupants.length < oldRoom.capacity) oldRoom.status = 'available';
                    }
                }
                students[idx] = { ...students[idx], ...data, photo: students[idx].photo };
                if (data.roomId && data.roomId !== oldRoomId) {
                    const newRoom = rooms.find(r => r.id === data.roomId);
                    if (newRoom) {
                        newRoom.occupants.push(data.id);
                        if (newRoom.occupants.length >= newRoom.capacity) newRoom.status = 'occupied';
                        data.roomNumber = newRoom.number;
                        data.block = newRoom.block;
                        students[idx].roomNumber = newRoom.number;
                        students[idx].block = newRoom.block;
                    }
                } else if (!data.roomId) {
                    students[idx].roomNumber = null;
                    students[idx].block = null;
                }
                AppCommon.toast('Student updated successfully', 'success');
            }
        } else {
            const newId = AppCommon.generateId('STU', students);
            const newStudent = { ...data, id: newId, admissionDate: new Date().toISOString().split('T')[0], status: 'active', photo: null };
            if (data.roomId) {
                const room = rooms.find(r => r.id === data.roomId);
                if (room) {
                    room.occupants.push(newId);
                    if (room.occupants.length >= room.capacity) room.status = 'occupied';
                    newStudent.roomNumber = room.number;
                    newStudent.block = room.block;
                }
            }
            students.push(newStudent);
            AppCommon.toast('Student added successfully', 'success');
        }

        storage.set('students', students);
        storage.set('rooms', rooms);
        AppCommon.closeModal();
        populateFilters();
        render();
    };

    window.StudentPage = {
        goPage(p) { currentPage = p; render(); },
        view(id) {
            const s = students.find(st => st.id === id);
            if (!s) return;
            AppCommon.openModal(`Student - ${s.firstName} ${s.lastName}`, `
                <div style="text-align:center;margin-bottom:20px;">
                    <div class="table-avatar" style="width:80px;height:80px;font-size:32px;margin:0 auto 12px;">${s.firstName.charAt(0)}</div>
                    <h2>${s.firstName} ${s.lastName}</h2>
                    <span class="badge badge-${s.status === 'active' ? 'success' : 'danger'} badge-dot">${s.status}</span>
                </div>
                <div class="form-grid">
                    <div><span class="text-xs text-gray">Student ID</span><p class="font-semibold">${s.id}</p></div>
                    <div><span class="text-xs text-gray">Email</span><p class="font-semibold">${s.email}</p></div>
                    <div><span class="text-xs text-gray">Phone</span><p class="font-semibold">${s.phone}</p></div>
                    <div><span class="text-xs text-gray">Branch</span><p class="font-semibold">${s.branch}</p></div>
                    <div><span class="text-xs text-gray">Year</span><p class="font-semibold">${s.year}</p></div>
                    <div><span class="text-xs text-gray">Room</span><p class="font-semibold">${s.roomNumber || 'Not Assigned'} ${s.block ? '(' + s.block + ')' : ''}</p></div>
                    <div><span class="text-xs text-gray">DOB</span><p class="font-semibold">${AppCommon.formatDate(s.dob)}</p></div>
                    <div><span class="text-xs text-gray">Blood Group</span><p class="font-semibold">${s.bloodGroup || 'N/A'}</p></div>
                    <div><span class="text-xs text-gray">City</span><p class="font-semibold">${s.city || 'N/A'}</p></div>
                    <div><span class="text-xs text-gray">State</span><p class="font-semibold">${s.state || 'N/A'}</p></div>
                    <div><span class="text-xs text-gray">Guardian</span><p class="font-semibold">${s.guardianName || 'N/A'}</p></div>
                    <div><span class="text-xs text-gray">Guardian Phone</span><p class="font-semibold">${s.guardianPhone || 'N/A'}</p></div>
                </div>
                <div class="mt-3"><span class="text-xs text-gray">Address</span><p>${s.address || 'N/A'}</p></div>
                <div class="mt-3"><span class="text-xs text-gray">Admission Date</span><p>${AppCommon.formatDate(s.admissionDate)}</p></div>
            `);
        },
        edit(id) {
            const s = students.find(st => st.id === id);
            if (!s) return;
            AppCommon.openModal('Edit Student', getFormHtml(s), 'lg');
            document.getElementById('studentForm').addEventListener('submit', saveStudent);
        },
        delete: async (id) => {
            const confirmed = await AppCommon.confirm('Delete Student', 'Are you sure you want to delete this student? This action cannot be undone.');
            if (!confirmed) return;
            students = storage.get('students') || [];
            rooms = storage.get('rooms') || [];
            const s = students.find(st => st.id === id);
            if (s && s.roomId) {
                const room = rooms.find(r => r.id === s.roomId);
                if (room) {
                    room.occupants = room.occupants.filter(oid => oid !== id);
                    if (room.occupants.length < room.capacity) room.status = 'available';
                }
            }
            students = students.filter(st => st.id !== id);
            storage.set('students', students);
            storage.set('rooms', rooms);
            AppCommon.toast('Student deleted successfully', 'success');
            populateFilters();
            render();
        }
    };

    document.getElementById('addStudentBtn').addEventListener('click', () => {
        AppCommon.openModal('Add Student', getFormHtml(), 'lg');
        document.getElementById('studentForm').addEventListener('submit', saveStudent);
        
        document.querySelector('#studentForm input[name="photo"]').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => { this.closest('.file-upload').querySelector('p').textContent = file.name; };
                reader.readAsDataURL(file);
            }
        });
    });

    document.getElementById('searchInput').addEventListener('input', AppCommon.debounce(() => { currentPage = 1; render(); }, 300));
    ['filterBranch', 'filterYear', 'filterStatus', 'filterRoom'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => { currentPage = 1; render(); });
    });

    document.getElementById('rowsPerPage').addEventListener('change', (e) => { perPage = parseInt(e.target.value); currentPage = 1; render(); });

    document.querySelectorAll('#studentsTable thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortCol = col; sortDir = 'asc'; }
            render();
        });
    });

    document.getElementById('selectAll').addEventListener('change', (e) => {
        document.querySelectorAll('#studentsBody .row-checkbox').forEach(cb => cb.checked = e.target.checked);
    });

    document.getElementById('exportExcelBtn').addEventListener('click', () => {
        const data = getFiltered().map(s => ({ ID: s.id, Name: `${s.firstName} ${s.lastName}`, Email: s.email, Phone: s.phone, Branch: s.branch, Year: s.year, Room: s.roomNumber || 'N/A', Block: s.block || 'N/A', Status: s.status }));
        AppCommon.exportToExcel(data, 'Students_Report');
    });

    document.getElementById('exportPdfBtn').addEventListener('click', () => {
        const data = getFiltered().map(s => ({ ID: s.id, Name: `${s.firstName} ${s.lastName}`, Email: s.email, Phone: s.phone, Branch: s.branch, Year: s.year, Room: s.roomNumber || 'N/A', Status: s.status }));
        AppCommon.exportToPdf('Student Report', ['ID', 'Name', 'Email', 'Phone', 'Branch', 'Year', 'Room', 'Status'], data, 'Students_Report');
    });

    document.getElementById('printBtn').addEventListener('click', () => AppCommon.printTable('Student Report', 'studentsTable'));

    populateFilters();
    render();
});