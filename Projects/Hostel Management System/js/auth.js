/* Hostel-Management-System/js/auth.js */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const tabs = document.querySelectorAll('.login-tab');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('loginPassword');
    let loginRole = 'admin';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loginRole = tab.dataset.tab;
        });
    });

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loginId').value.trim();
            const pwd = document.getElementById('loginPassword').value.trim();
            const remember = document.getElementById('rememberMe').checked;

            if (!id || !pwd) {
                AppCommon.toast('Please fill in all fields', 'warning');
                return;
            }

            const users = storage.get('users') || [];
            const user = users.find(u => u.id === id && u.password === pwd && u.role === loginRole);

            if (user) {
                const session = { id: user.id, name: user.name, email: user.email, role: user.role };
                storage.set('session', session);
                if (remember) {
                    storage.set('rememberedUser', { id: user.id, role: user.role });
                } else {
                    storage.remove('rememberedUser');
                }
                AppCommon.toast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                AppCommon.toast('Invalid credentials or wrong login type', 'error');
            }
        });

        const remembered = storage.get('rememberedUser');
        if (remembered) {
            document.getElementById('loginId').value = remembered.id;
            document.getElementById('rememberMe').checked = true;
            tabs.forEach(t => {
                t.classList.remove('active');
                if (t.dataset.tab === remembered.role) t.classList.add('active');
                loginRole = remembered.role;
            });
        }
    }

    const session = storage.get('session');
    if (session) {
        window.location.href = 'dashboard.html';
    }
});