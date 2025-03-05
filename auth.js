// Hardcoded credentials for demo (in real app, this should be server-side)
const validCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === validCredentials.username && password === validCredentials.password) {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'index.html';
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
});

// Redirect to login if not authenticated (for index.html)
if (window.location.pathname.includes('index.html')) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Add logout functionality
function logout() {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}