/**
 * Utility Functions for Portfolio
 */

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - success, error, info, warning
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const colors = {
        success: 'bg-green-500/20 border-green-500/50 text-green-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
    };

    toast.className = `p-4 rounded-lg border backdrop-blur-sm flex items-start gap-3 animate-slide-in-right ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} mt-1 text-lg flex-shrink-0"></i>
        <div class="flex-1">
            <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
            <p class="text-sm mt-1">${message}</p>
        </div>
        <button class="ml-2 text-lg leading-none opacity-70 hover:opacity-100 transition-opacity">
            <i class="fas fa-times"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate password strength
 * Returns: weak, fair, good, strong
 */
function validatePasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]/.test(password)) return 'strong';
    return 'good';
}

/**
 * Get form data as object
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

// ============================================================================
// FILE HANDLING
// ============================================================================

/**
 * Check if file is valid
 */
function isValidFile(file, validTypes = [], maxSize = 5242880) {
    if (!file) return false;
    if (file.size > maxSize) return false;
    if (validTypes.length > 0 && !validTypes.includes(file.type)) return false;
    return true;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Convert file to blob
 */
async function fileToBlob(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(new Blob([reader.result], { type: file.type }));
        reader.onerror = error => reject(error);
    });
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

/**
 * Set item in localStorage with expiration
 */
function setStorageItem(key, value, expirationMinutes = null) {
    const item = {
        value: value,
        timestamp: Date.now(),
        expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
    };
    localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Get item from localStorage
 */
function getStorageItem(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
        const parsed = JSON.parse(item);
        if (parsed.expiration && parsed.expiration < Date.now()) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.value;
    } catch {
        return item;
    }
}

/**
 * Remove item from localStorage
 */
function removeStorageItem(key) {
    localStorage.removeItem(key);
}

/**
 * Clear all localStorage
 */
function clearStorage() {
    localStorage.clear();
}

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Scroll to element smoothly
 */
function scrollToElement(selector, offset = 0) {
    const element = document.querySelector(selector);
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

/**
 * Scroll to top
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Toggle element class
 */
function toggleClass(selector, className) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.toggle(className);
    });
}

/**
 * Add class to elements
 */
function addClass(selector, className) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.add(className);
    });
}

/**
 * Remove class from elements
 */
function removeClass(selector, className) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.remove(className);
    });
}

/**
 * Show element
 */
function showElement(selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.remove('hidden');
    });
}

/**
 * Hide element
 */
function hideElement(selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.add('hidden');
    });
}

// ============================================================================
// DATE & TIME
// ============================================================================

/**
 * Format date
 */
function formatDate(date, format = 'MMM DD, YYYY') {
    if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date);
    }

    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    return date.toLocaleDateString('en-US', options);
}

/**
 * Get time ago (e.g., "2 days ago")
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Slugify string
 */
function slugify(string) {
    return string
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize string
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Truncate string
 */
function truncate(string, length = 100) {
    return string.length > length ? string.substring(0, length) + '...' : string;
}

/**
 * Copy to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// ============================================================================
// LOADING & ERROR STATES
// ============================================================================

/**
 * Show loading state on button
 */
function setButtonLoading(button, isLoading = true) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
    }
}

/**
 * Create skeleton loader
 */
function createSkeletonLoader(count = 1, height = '200px') {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<div class="skeleton" style="height: ${height}; margin-bottom: 16px;"></div>`;
    }
    return html;
}

// ============================================================================
// API & NETWORK
// ============================================================================

/**
 * Debounce function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check internet connection
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Wait for specific time
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MATH & CALCULATIONS
// ============================================================================

/**
 * Generate random ID
 */
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Percentage calculation
 */
function calculatePercentage(value, total) {
    return (value / total) * 100;
}

// ============================================================================
// BROWSER & DEVICE
// ============================================================================

/**
 * Detect device type
 */
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
}

/**
 * Detect browser
 */
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    
    return {
        browser: browser,
        userAgent: ua
    };
}

/**
 * Get viewport dimensions
 */
function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Safe JSON parse
 */
function safeJsonParse(json, defaultValue = null) {
    try {
        return JSON.parse(json);
    } catch {
        return defaultValue;
    }
}

/**
 * Handle async errors
 */
function handleAsyncError(error, defaultValue = null) {
    console.error('❌ Error:', error);
    return defaultValue;
}

// ============================================================================
// EXPORT & LOGGING
// ============================================================================

/**
 * Log with styling
 */
function logStyled(message, style = 'color: #3b82f6; font-weight: bold;') {
    console.log('%c' + message, style);
}

/**
 * Export data as JSON
 */
function exportAsJson(data, filename = 'export.json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

console.log('%c✅ Utils loaded successfully', 'color: #10b981; font-weight: bold;');
