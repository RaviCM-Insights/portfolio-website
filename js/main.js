/**
 * Main Portfolio JavaScript
 * Entry point for all portfolio functionality
 */

console.log('%c🚀 Portfolio loading...', 'color: #3b82f6; font-weight: bold; font-size: 14px;');

/**
 * Initialize portfolio when DOM is ready
 */
function initializePortfolio() {
    try {
        console.log('Initializing portfolio...');
        
        // Set current year in footer
        setCurrentYear();
        
        // Mobile menu setup
        setupMobileMenu();
        
        // Smooth scroll for anchor links
        setupSmoothScroll();
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Initialize theme
        initializeTheme();
        
        // Setup intersection observer for scroll animations
        setupScrollAnimations();
        
        // Setup page visibility tracking
        setupPageVisibilityTracking();
        
        // Setup performance monitoring
        setupPerformanceMonitoring();
        
        // Setup click tracking
        setupClickTracking();
        
        // Initialize error tracking
        initializeErrorTracking();
        
        // Setup network monitoring
        setupNetworkMonitoring();
        
        // Setup back to top button
        setupBackToTopButton();
        
        // Log page view
        logAnalytics('page_view', {
            page: window.location.pathname,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            device: getDeviceType()
        });
        
        console.log('%c✅ Portfolio initialized successfully', 'color: #10b981; font-weight: bold;');
    } catch (error) {
        console.error('❌ Portfolio initialization error:', error);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Set current year in footer
 */
function setCurrentYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Get device type
 */
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
}

// ============================================================================
// MOBILE MENU
// ============================================================================

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        // Toggle menu on button click
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Animate menu icon
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when link is clicked
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                
                // Reset icon
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }
}

// ============================================================================
// SMOOTH SCROLL
// ============================================================================

/**
 * Setup smooth scroll for anchor links
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }

                // Scroll with offset for fixed header
                const headerHeight = 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                logAnalytics('link_click', {
                    href: href,
                    text: this.textContent.substring(0, 50)
                });
            }
        });
    });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + / to show shortcuts help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            showKeyboardShortcuts();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }

        // Ctrl/Cmd + Home to scroll to top
        if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
            e.preventDefault();
            scrollToTop();
        }

        // Ctrl/Cmd + End to scroll to bottom
        if ((e.ctrlKey || e.metaKey) && e.key === 'End') {
            e.preventDefault();
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }

        // 'j' to jump to projects
        if (e.key === 'j' && !isInputFocused()) {
            e.preventDefault();
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // 'c' to jump to contact
        if (e.key === 'c' && !isInputFocused()) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

/**
 * Check if an input is focused
 */
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.tagName === 'SELECT';
}

/**
 * Show keyboard shortcuts help
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Ctrl/Cmd + /', action: 'Show shortcuts' },
        { key: 'Esc', action: 'Close modals' },
        { key: 'Ctrl/Cmd + Home', action: 'Scroll to top' },
        { key: 'Ctrl/Cmd + End', action: 'Scroll to bottom' },
        { key: 'j', action: 'Jump to projects' },
        { key: 'c', action: 'Jump to contact' }
    ];

    let html = '<div class="space-y-2">';
    shortcuts.forEach(shortcut => {
        html += `
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
                <span class="font-mono text-blue-400">${shortcut.key}</span>
                <span class="text-gray-400">${shortcut.action}</span>
            </div>
        `;
    });
    html += '</div>';

    showToast('Keyboard Shortcuts (close with Esc)' + html, 'info', 5000);
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.querySelectorAll('[id$="-modal"]').forEach(modal => {
        modal.classList.add('hidden');
    });
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

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Initialize theme (dark mode by default)
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemePreference('dark');
    } else {
        document.documentElement.classList.remove('dark');
        updateThemePreference('light');
    }

    // Listen for system theme preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const newTheme = e.matches ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }
}

/**
 * Update theme preference
 */
function updateThemePreference(theme) {
    localStorage.setItem('theme', theme);
}

// ============================================================================
// SCROLL ANIMATIONS
// ============================================================================

/**
 * Setup intersection observer for scroll animations
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-section');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe project cards
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
}

// ============================================================================
// PAGE VISIBILITY TRACKING
// ============================================================================

/**
 * Setup page visibility change tracking
 */
function setupPageVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('User left the page');
            logAnalytics('page_leave', { 
                timestamp: new Date(),
                duration: performance.now()
            });
        } else {
            console.log('User returned to the page');
            logAnalytics('page_return', { 
                timestamp: new Date()
            });
        }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
        logAnalytics('page_unload', { 
            timestamp: new Date(),
            duration: performance.now()
        });
    });
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    // Wait for page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            logPerformanceMetrics();
        }, 0);
    });
}

/**
 * Log performance metrics
 */
function logPerformanceMetrics() {
    try {
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const metrics = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                request: navigation.responseStart - navigation.requestStart,
                response: navigation.responseEnd - navigation.responseStart,
                dom: navigation.domInteractive - navigation.domLoading,
                load: navigation.loadEventEnd - navigation.loadEventStart,
                total: navigation.loadEventEnd - navigation.fetchStart
            };

            console.log('%cPerformance Metrics (ms):', 'color: #3b82f6; font-weight: bold;');
            console.table(metrics);

            logAnalytics('performance_metrics', metrics);
        }

        // Paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
            console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            logAnalytics(`paint_${entry.name}`, { time: entry.startTime });
        });

        // Largest contentful paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
                    logAnalytics('lcp', { time: lastEntry.startTime });
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported');
            }
        }

        // Cumulative layout shift
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            logAnalytics('cls', { value: clsValue });
                        }
                    }
                });
                observer.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported');
            }
        }
    } catch (error) {
        console.warn('Performance monitoring error:', error);
    }
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Setup click tracking
 */
function setupClickTracking() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        
        if (target) {
            let clickData = {
                element: target.tagName,
                text: target.textContent.substring(0, 50),
                timestamp: new Date()
            };

            if (target.tagName === 'A') {
                clickData.href = target.href;
                clickData.target = target.target;
            }

            if (target.id) {
                clickData.id = target.id;
            }

            if (target.className) {
                clickData.classes = target.className.substring(0, 50);
            }

            logAnalytics('element_click', clickData);
        }
    }, true);
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Initialize error tracking
 */
function initializeErrorTracking() {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('❌ JavaScript Error:', event.error);
        
        logAnalytics('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack?.substring(0, 200)
        });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled Promise Rejection:', event.reason);
        
        logAnalytics('unhandled_rejection', {
            reason: String(event.reason).substring(0, 200),
            promise: event.promise?.constructor?.name
        });
    });

    // Catch console errors
    const originalError = console.error;
    console.error = function(...args) {
        originalError.apply(console, args);
        
        logAnalytics('console_error', {
            message: args.map(arg => String(arg).substring(0, 100)).join(' | ')
        });
    };
}

// ============================================================================
// NETWORK MONITORING
// ============================================================================

/**
 * Setup network information monitoring
 */
function setupNetworkMonitoring() {
    if (navigator.connection) {
        const connection = navigator.connection;
        
        console.log(`📡 Network Info:
            Type: ${connection.effectiveType}
            Downlink: ${connection.downlink} Mbps
            RTT: ${connection.rtt} ms
            Saver: ${connection.saveData ? 'On' : 'Off'}`
        );

        logAnalytics('network_info', {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        });

        // Monitor connection changes
        connection.addEventListener('change', () => {
            console.log(`📡 Network changed to: ${connection.effectiveType}`);
            logAnalytics('network_change', {
                type: connection.effectiveType
            });
        });
    }
}

// ============================================================================
// BACK TO TOP BUTTON
// ============================================================================

/**
 * Setup back to top button functionality
 */
function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('hidden');
        } else {
            backToTopBtn.classList.add('hidden');
        }
    }, 300));

    // Click to scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        logAnalytics('back_to_top_click', { timestamp: new Date() });
    });

    // Smooth hover animation
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'scale(1.1)';
    });

    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'scale(1)';
    });
}

// ============================================================================
// THROTTLE & DEBOUNCE
// ============================================================================

/**
 * Throttle function - limits execution frequency
 */
function throttle(func, limit) {
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
 * Debounce function - delays execution until user stops
 */
function debounce(func, wait) {
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

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Log analytics event
 */
function logAnalytics(event, data = {}) {
    try {
        // Add metadata
        const analyticsData = {
            event,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...data
        };

        // Log to console (development)
        if (process?.env?.NODE_ENV !== 'production') {
            console.log('%cAnalytics:', 'color: #a855f7; font-weight: bold;', event, data);
        }

        // Store in sessionStorage for later analysis
        try {
            const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
            events.push(analyticsData);
            sessionStorage.setItem('analytics_events', JSON.stringify(events));
        } catch (e) {
            console.warn('Could not store analytics:', e);
        }

        // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
        // Example: gtag('event', event, analyticsData);
        
    } catch (error) {
        console.warn('Analytics logging error:', error);
    }
}

/**
 * Export analytics data
 */
function exportAnalytics() {
    try {
        const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
        console.table(events);
        exportAsJson(events, 'analytics.json');
    } catch (error) {
        console.error('Error exporting analytics:', error);
    }
}

// Make available globally
window.exportAnalytics = exportAnalytics;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}

/**
 * Log when everything is fully loaded
 */
window.addEventListener('load', () => {
    console.log('%c✨ Portfolio fully loaded!', 'color: #ec4899; font-weight: bold; font-size: 16px;');
    logAnalytics('portfolio_loaded', {
        readyTime: performance.now()
    });
});

/**
 * Handle page visibility
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 Page hidden');
    } else {
        console.log('👁️ Page visible');
    }
});

// ============================================================================
// EXPORT FUNCTIONS FOR CONSOLE USE
// ============================================================================

// Make utility functions available in console for debugging
window.portfolioUtils = {
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    },
    showAnalytics: () => exportAnalytics(),
    getPerformance: () => performance.getEntriesByType('navigation')[0],
    getNetworkInfo: () => navigator.connection,
    getDeviceType: getDeviceType,
    scrollToTop: scrollToTop,
    toggleTheme: () => {
        const current = localStorage.getItem('theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        updateThemePreference(newTheme);
        document.documentElement.classList.toggle('dark');
    }
};

console.log('%cDebug Tools Available:', 'color: #3b82f6; font-weight: bold;');
console.log('portfolioUtils.scrollToSection(id), portfolioUtils.showAnalytics(), portfolioUtils.toggleTheme()');

// ============================================================================
// END OF MAIN.JS
// ============================================================================

console.log('%c🎉 Main.js loaded successfully!', 'color: #10b981; font-weight: bold; font-size: 14px;');S
