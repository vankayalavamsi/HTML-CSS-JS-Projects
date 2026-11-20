/* Hostel-Management-System/js/common.js */
class AppCommon {
    static init() {
        this.hideLoaders();
        this.initSidebar();
        this.initDropdowns();
        this.initNotifications();
        this.initLogout();
    }

    static hideLoaders() {
        setTimeout(() => {
            const al = document.getElementById('appLoader');
            const ll = document.getElementById('loginLoader');
            const lc = document.getElementById('loginContainer');
            if (al) al.style.display = 'none';
            if (ll) ll.style.display = 'none';
            if (lc) lc.style.display = 'flex';
        }, 600);
    }

    static initSidebar() {
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        const closeBtn = document.getElementById('sidebarClose');
        let overlay = document.querySelector('.sidebar-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.add('open');
                overlay.classList.add('show');
            });
        }

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        };

        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'dashboard.html')) {
                link.classList.add('active');
            } else if (href && href.startsWith('pages/')) {
                if (currentPath === href.replace('pages/', '')) link.classList.add('active');
            }
        });
    }

    static initDropdowns() {
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const userDrop = userMenu ? userMenu.querySelector('.user-dropdown') : null;
            const notifWrapper = document.querySelector('.notification-wrapper');
            const notifDrop = notifWrapper ? notifWrapper.querySelector('.notification-dropdown') : null;

            if (userMenu && !userMenu.contains(e.target)) {
                if (userDrop) userDrop.classList.remove('show');
            } else if (userMenu && userMenu.contains(e.target) && e.target !== userMenu && !e.target.closest('.user-dropdown a')) {
                if (userDrop) userDrop.classList.toggle('show');
                if (notifDrop) notifDrop.classList.remove('show');
            }

            if (notifWrapper && !notifWrapper.contains(e.target)) {
                if (notifDrop) notifDrop.classList.remove('show');
            } else if (notifWrapper && notifWrapper.contains(e.target) && !e.target.closest('.notif-body')) {
                if (notifDrop) notifDrop.classList.toggle('show');
                if (userDrop) userDrop.classList.remove('show');
            }
        });
    }

    static initNotifications() {
        const body = document.getElementById('notifBody');
        if (!body) return;
        const notifications = [
            { icon: 'fas fa-user-plus', color: 'blue', text: 'New student Aarav Sharma registered', time: '2 mins ago' },
            { icon: 'fas fa-exclamation-circle', color: 'red', text: 'High priority complaint in Block A', time: '15 mins ago' },
            { icon: 'fas fa-money-bill', color: 'green', text: 'Fee payment received from Diya Patel', time: '1 hour ago' },
            { icon: 'fas fa-bullhorn', color: 'yellow', text: 'New notice posted by Admin', time: '3 hours ago' },
            { icon: 'fas fa-id-card', color: 'blue', text: 'Visitor checked in at Block B', time: '5 hours ago' }
        ];
        body.innerHTML = notifications.map((n, i) => `
            <div class="notif-item ${i === 0 ? 'unread' : ''}">
                <div class="notif-icon ${n.color}"><i class="${n.icon}"></i></div>
                <div class="notif-text">
                    <p>${n.text}</p>
                    <span>${n.time}</span>
                </div>
            </div>
        `).join('');
    }

    static initLogout() {
        const sidebarLogout = document.getElementById('sidebarLogout');
        const dropdownLogout = document.getElementById('dropdownLogout');
        const doLogout = () => {
            storage.remove('session');
            window.location.href = '../index.html';
        };
        if (sidebarLogout) sidebarLogout.addEventListener('click', doLogout);
        if (dropdownLogout) dropdownLogout.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
    }

    static requireAuth() {
        const session = storage.get('session');
        if (!session) {
            window.location.href = '../index.html';
            return null;
        }
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');
        if (userName) userName.textContent = session.name;
        if (userRole) userRole.textContent = session.role === 'admin' ? 'Administrator' : 'Student';
        if (userAvatar) userAvatar.textContent = session.name.charAt(0).toUpperCase();
        return session;
    }

    static toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            const c = document.createElement('div');
            c.id = 'toastContainer';
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><div class="toast-content"><p>${message}</p></div><button class="toast-close" onclick="this.parentElement.classList.add('toast-exit');setTimeout(()=>this.parentElement.remove(),300)">&times;</button>`;
        (container || document.getElementById('toastContainer')).appendChild(toast);
        setTimeout(() => { if (toast.parentElement) { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); } }, 4000);
    }

    static confirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('confirmOverlay');
            const titleEl = document.getElementById('confirmTitle');
            const msgEl = document.getElementById('confirmMsg');
            const yesBtn = document.getElementById('confirmYes');
            const noBtn = document.getElementById('confirmNo');
            if (!overlay) { resolve(false); return; }
            titleEl.textContent = title;
            msgEl.textContent = message;
            overlay.classList.add('show');
            const cleanup = (val) => { overlay.classList.remove('show'); yesBtn.replaceWith(yesBtn.cloneNode(true)); noBtn.replaceWith(noBtn.cloneNode(true)); resolve(val); };
            yesBtn.addEventListener('click', () => cleanup(true), { once: true });
            noBtn.addEventListener('click', () => cleanup(false), { once: true });
        });
    }

    static openModal(title, bodyHtml, size = '') {
        const overlay = document.getElementById('modalOverlay');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');
        const modal = document.getElementById('modal');
        if (!overlay) return;
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;
        modal.className = 'modal' + (size ? ' modal-' + size : '');
        overlay.classList.add('show');
    }

    static closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    static generateId(prefix, list, padLength = 3) {
        if (!list || list.length === 0) return prefix + '001';
        const nums = list.map(item => {
            const id = item.id || '';
            const num = parseInt(id.replace(prefix, ''), 10);
            return isNaN(num) ? 0 : num;
        });
        const max = Math.max(...nums);
        return prefix + String(max + 1).padStart(padLength, '0');
    }

    static formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    static formatCurrency(amount) {
        return '₹' + Number(amount).toLocaleString('en-IN');
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static exportToExcel(data, filename, sheetName = 'Sheet1') {
        if (typeof XLSX === 'undefined') { AppCommon.toast('SheetJS library not loaded', 'error'); return; }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename + '.xlsx');
        AppCommon.toast('Excel exported successfully', 'success');
    }

    static exportToPdf(title, columns, data, filename) {
        if (typeof jspdf === 'undefined' || typeof jspdfAutoTable === 'undefined') { AppCommon.toast('jsPDF library not loaded', 'error'); return; }
        const doc = new jspdf.jsPDF('l', 'mm', 'a4');
        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text('Generated: ' + new Date().toLocaleString(), 14, 22);
        doc.autoTable({
            head: [columns],
            body: data.map(row => columns.map(col => row[col] || '')),
            startY: 28,
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        doc.save(filename + '.pdf');
        AppCommon.toast('PDF exported successfully', 'success');
    }

    static printTable(title, tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#6366f1;color:white}tr:nth-child(even){background:#f9f9f9}h1{font-size:18px}p{color:#666}</style></head><body><h1>${title}</h1><p>Printed: ${new Date().toLocaleString()}</p>`);
        win.document.write(table.outerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    AppCommon.init();
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalClose) modalClose.addEventListener('click', AppCommon.closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) AppCommon.closeModal(); });
});