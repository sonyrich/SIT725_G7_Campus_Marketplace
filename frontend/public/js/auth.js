// frontend/public/js/auth.js

const API_BASE = '/api/auth';

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // stops the browser's default GET submission

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('loginMessage');

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                messageEl.textContent = data.message || 'Login failed. Please check your details.';
                messageEl.style.color = 'red';
                return;
            }

            // Store the JWT so later requests (create listing, my listings, etc.) can use it
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            messageEl.textContent = 'Login successful! Redirecting...';
            messageEl.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);

        } catch (err) {
            console.error('Login error:', err);
            messageEl.textContent = 'Something went wrong. Is the backend server running?';
            messageEl.style.color = 'red';
        }
    });
}

// ---------- REGISTER ----------
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const studentId = document.getElementById('studentId').value;
        const messageEl = document.getElementById('registerMessage');

        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match.';
            messageEl.style.color = 'red';
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, studentId })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                messageEl.textContent = data.message || 'Registration failed.';
                messageEl.style.color = 'red';
                return;
            }

            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            messageEl.textContent = 'Account created! Redirecting...';
            messageEl.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);

        } catch (err) {
            console.error('Register error:', err);
            messageEl.textContent = 'Something went wrong. Is the backend server running?';
            messageEl.style.color = 'red';
        }
    });
}