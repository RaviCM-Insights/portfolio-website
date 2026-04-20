/**
 * Animation Setup - GSAP and AOS
 */

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    disable: 'mobile'
});

/**
 * Hero Section Animations
 */
function initHeroAnimations() {
    // Animated typewriter effect
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;

    const roles = [
        'Full Stack Developer',
        'UI/UX Designer',
        'AI Enthusiast',
        'Problem Solver'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        typingText.textContent = currentRole.substring(0, charIndex);

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    typeWriter();

    // Hero text animations with GSAP
    gsap.from('h1', {
        duration: 1,
        opacity: 0,
        y: 30,
        ease: 'power3.out'
    });

    gsap.from('#typing-text', {
        duration: 1,
        opacity: 0,
        delay: 0.3,
        y: 20,
        ease: 'power3.out'
    });

    gsap.from('.hero-section p:nth-of-type(2)', {
        duration: 1,
        opacity: 0,
        delay: 0.6,
        y: 20,
        ease: 'power3.out'
    });

    gsap.from('.hero-section a', {
        duration: 1,
        opacity: 0,
        delay: 0.9,
        y: 20,
        stagger: 0.2,
        ease: 'power3.out'
    });
}

/**
 * Skill Bar Animations
 */
function animateSkillBars() {
    const skillBars = document.querySelectorAll('[data-skill-width]');
    
    if (skillBars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-skill-width');
                
                gsap.to(bar, {
                    width: width,
                    duration: 1.5,
                    ease: 'power3.out'
                });

                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

/**
 * Project Card Animations
 */
function animateProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach((card, index) => {
        // Stagger animations
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            duration: 0.8,
            opacity: 0,
            y: 40,
            ease: 'power3.out',
            delay: index * 0.1
        });

        // Hover animation
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -10,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Section Title Animations
 */
function animateSectionTitles() {
    gsap.utils.toArray('section h2').forEach((title) => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            duration: 0.8,
            opacity: 0,
            y: 30,
            ease: 'power3.out'
        });
    });
}

/**
 * Button Hover Animations
 */
function setupButtonAnimations() {
    document.querySelectorAll('.btn, button').forEach(button => {
        if (button.classList.contains('filter-btn')) {
            button.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            });
        }

        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Back to Top Button
 */
function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('hidden');
        } else {
            backToTopBtn.classList.add('hidden');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        gsap.to(window, {
            scrollTo: 0,
            duration: 1,
            ease: 'power2.inOut'
        });
    });
}

/**
 * Modal Animations
 */
function setupModalAnimations() {
    const modals = document.querySelectorAll('[id$="-modal"]');
    
    modals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('[id$="-modal"] button:first-child, #close-modal, #cancel-delete');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                gsap.to(modal.querySelector('[class*="max-w-"]'), {
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        modal.classList.add('hidden');
                    }
                });
            });
        });

        // Show animation
        const observer = new MutationObserver(() => {
            if (!modal.classList.contains('hidden')) {
                const content = modal.querySelector('[class*="max-w-"]');
                if (content) {
                    gsap.fromTo(content, 
                        {
                            scale: 0.95,
                            opacity: 0
                        },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 0.3,
                            ease: 'back.out'
                        }
                    );
                }
            }
        });

        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
}

/**
 * Scroll-triggered fade-in
 */
function setupScrollFadeIn() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('[data-aos]').forEach((element) => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                end: 'top 50%',
                toggleActions: 'play none none none'
            },
            duration: 0.8,
            opacity: 0,
            y: 30,
            ease: 'power3.out'
        });
    });
}

/**
 * Form field animations
 */
function setupFormAnimations() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input, {
                scale: 1.02,
                duration: 0.2,
                ease: 'power2.out'
            });
        });

        input.addEventListener('blur', () => {
            gsap.to(input, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Initialize all animations
 */
function initializeAllAnimations() {
    try {
        console.log('Initializing animations...');
        
        initHeroAnimations();
        animateSkillBars();
        animateProjectCards();
        animateSectionTitles();
        setupButtonAnimations();
        setupBackToTopButton();
        setupModalAnimations();
        setupScrollFadeIn();
        setupFormAnimations();

        console.log('✅ All animations initialized');
    } catch (error) {
        console.error('❌ Animation initialization error:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllAnimations);
} else {
    initializeAllAnimations();
}
