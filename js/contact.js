/**
 * Contact Form Module
 */

/**
 * Initialize contact form
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleContactFormSubmit(contactForm);
    });

    console.log('✅ Contact form initialized');
}

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(form) {
    try {
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            createdAt: new Date(),
            ip: 'visitor',
            userAgent: navigator.userAgent
        };

        // Validate
        if (!data.name || !data.email || !data.subject || !data.message) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (!isValidEmail(data.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (data.message.length < 10) {
            showToast('Message must be at least 10 characters', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true);

        // Save to Firestore
        if (db) {
            await db.collection('contact_submissions').add(data);
            console.log('✅ Contact form submitted to Firestore');
        }

        // Show success message
        showToast('Thank you! Your message has been sent successfully.', 'success');

        // Reset form
        form.reset();
        setButtonLoading(submitBtn, false);

        // Optional: Send email via backend (future implementation)
        // await sendContactEmail(data);

    } catch (error) {
        console.error('Error submitting contact form:', error);
        showToast('Failed to send message. Please try again.', 'error');
        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, false);
    }
}

/**
 * Send contact email via backend (future implementation)
 */
async function sendContactEmail(data) {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Email sending failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Validate contact form in real-time
 */
function setupContactFormValidation() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const inputs = contactForm.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateContactInput(input);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateContactInput(input);
            }
        });
    });
}

/**
 * Validate individual contact input
 */
function validateContactInput(input) {
    let isValid = true;
    let errorMessage = '';

    if (!input.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (input.name === 'email' && !isValidEmail(input.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (input.name === 'message' && input.value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters';
    }

    if (isValid) {
        input.classList.remove('error', 'border-red-500');
        input.classList.add('border-green-500');
    } else {
        input.classList.add('error', 'border-red-500');
        input.classList.remove('border-green-500');
    }

    // Show error message
    const errorElement = input.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.toggle('hidden', isValid);
    }

    return isValid;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeContactForm();
        setupContactFormValidation();
    });
} else {
    initializeContactForm();
    setupContactFormValidation();
}
