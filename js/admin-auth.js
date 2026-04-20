/**
 * Admin Authentication Module
 */

/**
 * Initialize admin authentication
 */
function initializeAdminAuth() {
    setupLoginForm();
    checkAuthStatus();
    setupPasswordToggle();
    console.log('✅ Admin auth initialized');
}

/**
 * Check if user is authenticated
 */
function checkAuthStatus() {
    if (!auth) {
        console.warn('Firebase auth not initialized');
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ User authenticated:', user.email);
            
            // If on login page, redirect to dashboard
            if (window.location.pathname.includes('admin.html')) {
                window.location.href = 'admin-dashboard.html';
            }
            
            // Store user info
            setStorageItem('adminUser', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Admin'
            });
        } else {
            console.log('❌ User not authenticated');
            
            // If on dashboard, redirect to login
            if (window.location.pathname.includes('admin-dashboard.html')) {
                window.location.href = 'admin.html';
            }
            
            // Clear stored user info
            removeStorageItem('adminUser');
        }
    });
}

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(loginForm);
    });
}

/**
 * Handle login
 */
async function handleLogin(form) {
    try {
        if (!auth) {
            showToast('Firebase not initialized', 'error');
            return;
        }

        const email = form.querySelector('input[name="email"]').value.trim();
        const password = form.querySelector('input[name="password"]').value;
        const rememberMe = form.querySelector('input[name="remember"]').checked;

        // Validation
        if (!email || !password) {
            showToast('Please enter email and password', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true);

        // Login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('✅ Login successful:', user.email);
        showToast('Welcome back!', 'success');

        // Store remember me preference
        if (rememberMe) {
            setStorageItem('rememberEmail', email, 30 * 24 * 60); // 30 days
        }

        // Store user session
        setStorageItem('adminUser', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Admin'
        });

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        setButtonLoading(form.querySelector('button[type="submit"]'), false);
        
        handleLoginError(error, form);
    }
}

/**
 * Handle login errors
 */
function handleLoginError(error, form) {
    const errorContainer = form.querySelector('#login-error');
    
    let message = 'Login failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
        message = 'Email not registered';
    } else if (error.code === 'auth/wrong-password') {
        message = 'Invalid password';
    } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format';
    } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled';
    } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Try again later';
    }

    showToast(message, 'error');
    
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        if (!auth) return;

        const confirmLogout = confirm('Are you sure you want to logout?');
        if (!confirmLogout) return;

        await auth.signOut();
        
        console.log('✅ Logged out successfully');
        showToast('You have been logged out', 'info');
        
        // Clear storage
        removeStorageItem('adminUser');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 500);

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

/**
 * Setup password visibility toggle
 */
function setupPasswordToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-password');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const passwordInput = btn.closest('.relative').querySelector('input[type="password"], input[type="text"]');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                btn.querySelector('i').classList.remove('fa-eye');
                btn.querySelector('i').classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                btn.querySelector('i').classList.remove('fa-eye-slash');
                btn.querySelector('i').classList.add('fa-eye');
            }
        });
    });
}

/**
 * Setup logout button
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Populate admin name
 */
function populateAdminName() {
    const adminNameEl = document.getElementById('admin-name');
    if (!adminNameEl) return;

    const adminUser = getStorageItem('adminUser');
    if (adminUser) {
        adminNameEl.textContent = `${adminUser.displayName} (${adminUser.email})`;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAdminAuth();
        setupLogoutButton();
        populateAdminName();
    });
} else {
    initializeAdminAuth();
    setupLogoutButton();
    populateAdminName();
}
