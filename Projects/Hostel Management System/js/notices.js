/* Hostel-Management-System/js/notices.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    let notices = storage.get('notices') || [];
    let currentFilter = 'all';
    let currentPage = 1;
    const perPage = 6;

    const getFiltered = () => {
        let filtered = notices.filter(n => n.active);
        if (currentFilter === 'pinned') filtered = filtered.filter(n => n.pinned);
        else if (currentFilter === 'high') filtered = filtered.filter(n => n.priority === 'high');
        else if (currentFilter !== 'all') filtered = filtered.filter(n => n.category === currentFilter);
        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };

    const render = () => {
        const filtered = getFiltered();
        const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * perPage;
        const pageData = filtered.slice(start, start + perPage);

        const container = document.getElementById('noticesList');
        if (pageData.length === 0) {
            container.innerHTML = '<div class="card"><div class="card-body text-center" style="padding:40px;"><i class="fas fa-bullhorn" style="font-size:48px;color:var(--gray-light);margin-bottom:12px;display:block;"></i><p class="text-gray">No notices found</p></div></div>';
        } else {
            container.innerHTML = pageData.map(n => {
                const borderColor = n.priority === 'high' ? 'var(--danger)' : n.pinned ? 'var(--primary)' : 'var(--border)';
                const catColor = { 'General': 'primary', 'Academic': 'info', 'Maintenance': 'warning', 'Event': 'success', 'Emergency': 'danger', 'Rules': 'secondary' };
                return `<div class="card" style="border-left:4px solid ${borderColor};">
                    <div class="card-body">
                        <div class="d-flex justify-between align-center mb-2 flex-wrap gap-2">
                            <div class="d-flex align-center gap-2">
                                ${n.pinned ? '<i class="fas fa-thumbtack" style="color:var(--primary);"></i>' : ''}
                                <h3 style="font-size:16px;font-weight:600;">${n.title}</h3>
                            </div>
                            <div class="d-flex gap-1">
                                <span class="badge badge-${catColor[n.category] || 'secondary'}">${n.category}</span>
                                ${n.priority === 'high' ? '<span class="badge badge-danger">Important</span>' : ''}
                            </div>
                        </div>
                        <p class="text-sm text-gray mb-2">${n.content}</p>
                        <div class="d-flex justify-between align-center">
                            <span class="text-xs text-gray"><i class="fas fa-calendar"></i> ${AppCommon.formatDate(n.createdAt)} &nbsp;|&nbsp; <i class="fas fa-user"></i> ${n.createdBy}</span>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-secondary" onclick="NoticePage.edit('${n.id}')"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="NoticePage.delete('${n.id}')"><i class="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        const pagDiv = document.getElementById('pagination');
        let pagHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            pagHtml += `<button class="${i === currentPage ? 'active' : ''}" onclick="NoticePage.goPage(${i})">${i}</button>`;
        }
        pagDiv.innerHTML = pagHtml;
    };

    window.NoticePage = {
        goPage(p) { currentPage = p; render(); },
        edit(id) {
            const n = notices.find(nt => nt.id === id);
            if (!n) return;
            AppCommon.openModal('Edit Notice', `
                <form id="noticeForm">
                    <div class="form-group"><label class="form-label-required">Title</label><input type="text" class="form-control" name="title" value="${n.title}" required></div>
                    <div class="form-group"><label>Content</label><textarea class="form-control" name="content" rows="4">${n.content}</textarea></div>
                    <div class="form-row-3">
                        <div class="form-group"><label>Category</label><select class="form-control" name="category">${['General','Academic','Maintenance','Event','Emergency','Rules'].map(c => `<option ${n.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
                        <div class="form-group"><label>Priority</label><select class="form-control" name="priority"><option value="low" ${n.priority === 'low' ? 'selected' : ''}>Low</option><option value="medium" ${n.priority === 'medium' ? 'selected' : ''}>Medium</option><option value="high" ${n.priority === 'high' ? 'selected' : ''}>High</option></select></div>
                        <div class="form-group"><label>Expires</label><input type="date" class="form-control" name="expiresAt" value="${n.expiresAt || ''}"></div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label"><input type="checkbox" name="pinned" ${n.pinned ? 'checked' : ''}> Pin this notice</label>
                    </div>
                    <input type="hidden" name="id" value="${n.id}">
                </form>
            `, 'lg');
            document.getElementById('noticeForm').addEventListener('submit', saveNotice);
        },
        delete: async (id) => {
            if (!await AppCommon.confirm('Delete Notice', 'Are you sure you want to delete this notice?')) return;
            notices = storage.get('notices') || [];
            notices = notices.filter(n => n.id !== id);
            storage.set('notices', notices);
            AppCommon.toast('Notice deleted', 'success');
            render();
        }
    };

    const saveNotice = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.pinned = fd.has('pinned');
        if (!data.title) { AppCommon.toast('Title is required', 'warning'); return; }

        notices = storage.get('notices') || [];
        if (data.id) {
            const idx = notices.findIndex(n => n.id === data.id);
            if (idx > -1) { notices[idx] = { ...notices[idx], ...data }; AppCommon.toast('Notice updated', 'success'); }
        } else {
            notices.push({
                id: AppCommon.generateId('NTC', notices), ...data, active: true,
                createdBy: session.name, createdAt: new Date().toISOString().split('T')[0]
            });
            AppCommon.toast('Notice created', 'success');
        }
        storage.set('notices', notices);
        AppCommon.closeModal();
        render();
    };

    document.getElementById('addNoticeBtn').addEventListener('click', () => {
        AppCommon.openModal('Create Notice', `
            <form id="noticeForm">
                <div class="form-group"><label class="form-label-required">Title</label><input type="text" class="form-control" name="title" required placeholder="Enter notice title"></div>
                <div class="form-group"><label>Content</label><textarea class="form-control" name="content" rows="4" placeholder="Enter notice content"></textarea></div>
                <div class="form-row-3">
                    <div class="form-group"><label>Category</label><select class="form-control" name="category"><option>General</option><option>Academic</option><option>Maintenance</option><option>Event</option><option>Emergency</option><option>Rules</option></select></div>
                    <div class="form-group"><label>Priority</label><select class="form-control" name="priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div>
                    <div class="form-group"><label>Expires</label><input type="date" class="form-control" name="expiresAt"></div>
                </div>
                <div class="form-group">
                    <label class="checkbox-label"><input type="checkbox" name="pinned"> Pin this notice</label>
                </div>
            </form>
        `, 'lg');
        document.getElementById('noticeForm').addEventListener('submit', saveNotice);
    });

    document.querySelectorAll('#noticeTabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#noticeTabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            render();
        });
    });

    render();
});