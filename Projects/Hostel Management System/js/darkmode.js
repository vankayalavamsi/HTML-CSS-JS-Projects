/* Hostel-Management-System/js/darkmode.js */
class DarkMode {
    static init() {
        const toggle = document.getElementById('themeToggle');
        const saved = storage.get('settings');
        const theme = saved ? saved.theme : 'light';
        this.applyTheme(theme);

        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                this.applyTheme(next);
                this.saveTheme(next);
            });
        }
    }

    static applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    static saveTheme(theme) {
        const settings = storage.get('settings') || {};
        settings.theme = theme;
        storage.set('settings', settings);
    }
}

document.addEventListener('DOMContentLoaded', () => DarkMode.init());