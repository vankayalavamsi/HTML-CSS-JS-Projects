/* Hostel-Management-System/js/settings.js */
document.addEventListener('DOMContentLoaded', () => {
    const session = AppCommon.requireAuth();
    if (!session) return;

    const settings = storage.get('settings') || { theme: 'light', currency: 'INR', hostelName: 'HostelMS', rowsPerPage: 10 };

    // Load current settings into form
    document.querySelectorAll('input[name="theme"]').forEach(r => { if (r.value === settings.theme) r.checked = true; });
    document.getElementById('rowsPerPageSetting').value = settings.rowsPerPage || 10;
    document.getElementById('hostelName').value = settings.hostelName || 'HostelMS';
    document.getElementById('currencySetting').value = settings.currency || 'INR';

    // Theme radio buttons
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            DarkMode.applyTheme(radio.value);
        });
    });

    // Save settings
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const theme = document.querySelector('input[name="theme"]:checked').value;
        const rowsPerPage = parseInt(document.getElementById('rowsPerPageSetting').value);
        const hostelName = document.getElementById('hostelName').value.trim();
        const currency = document.getElementById('currencySetting').value;

        storage.set('settings', { theme, rowsPerPage, hostelName, currency });
        DarkMode.applyTheme(theme);
        
        // Update sidebar brand
        const brand = document.querySelector('.sidebar-brand');
        if (brand && hostelName) brand.textContent = hostelName;

        AppCommon.toast('Settings saved successfully', 'success');
    });

    // Change password
    document.getElementById('changePwdBtn').addEventListener('click', () => {
        const current = document.getElementById('currentPwd').value;
        const newPwd = document.getElementById('newPwd').value;
        const confirm = document.getElementById('confirmPwd').value;

        if (!current || !newPwd || !confirm) {
            AppCommon.toast('Please fill all password fields', 'warning');
            return;
        }
        if (newPwd.length < 4) {
            AppCommon.toast('Password must be at least 4 characters', 'warning');
            return;
        }
        if (newPwd !== confirm) {
            AppCommon.toast('New password and confirmation do not match', 'error');
            return;
        }

        const users = storage.get('users') || [];
        const user = users.find(u => u.id === session.id);
        if (!user) {
            AppCommon.toast('User not found', 'error');
            return;
        }
        if (user.password !== current) {
            AppCommon.toast('Current password is incorrect', 'error');
            return;
        }

        user.password = newPwd;
        storage.set('users', users);
        document.getElementById('currentPwd').value = '';
        document.getElementById('newPwd').value = '';
        document.getElementById('confirmPwd').value = '';
        AppCommon.toast('Password changed successfully', 'success');
    });

    // Backup data
    document.getElementById('backupBtn').addEventListener('click', () => {
        const data = storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hostelms_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        AppCommon.toast('Backup downloaded successfully', 'success');
    });

    // Restore data
    document.getElementById('restoreBtn').addEventListener('click', () => {
        document.getElementById('restoreFile').click();
    });

    document.getElementById('restoreFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const success = storage.importData(ev.target.result);
            if (success) {
                AppCommon.toast('Data restored successfully. Please reload the page.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } else {
                AppCommon.toast('Failed to restore data. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Reset application
    document.getElementById('resetBtn').addEventListener('click', async () => {
        const confirmed = await AppCommon.confirm('Reset Application', 'This will delete ALL data and reload sample data. This action CANNOT be undone. Are you absolutely sure?');
        if (!confirmed) return;
        
        const doubleConfirm = await AppCommon.confirm('Final Warning', 'Last chance! All your data will be permanently deleted.');
        if (!doubleConfirm) return;

        storage.clearAll();
        storage.initializeSampleData();
        AppCommon.toast('Application reset successfully. Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1500);
    });
});