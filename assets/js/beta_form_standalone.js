// Standalone beta form JavaScript (no ES6 modules to avoid CORS issues)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('beta-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const interestsCheckboxes = document.querySelectorAll('input[name="interests"]');
    const referralSourceSelect = document.getElementById('referralSource');
    const commentsTextarea = document.getElementById('comments');
    const submitButton = document.getElementById('submit-button');
    const submitButtonText = document.getElementById('submit-button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const formMainContent = document.getElementById('form-main-content');
    const formSuccessState = document.getElementById('form-success-state');
    const submitError = document.getElementById('submit-error');
    const closeFormButton = document.getElementById('close-form-button');

    const formData = {
        name: '',
        email: '',
        interests: [],
        comments: '',
        referralSource: ''
    };

    const errors = {};

    // Initialize form data from inputs
    const updateFormData = () => {
        formData.name = nameInput.value;
        formData.email = emailInput.value;
        formData.comments = commentsTextarea.value;
        formData.referralSource = referralSourceSelect.value;
        formData.interests = Array.from(interestsCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    };

    const validateForm = () => {
        let isValid = true;
        errors.name = '';
        errors.email = '';
        errors.submit = '';

        if (!formData.email) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        displayErrors();
        return isValid;
    };

    const displayErrors = () => {
        document.getElementById('name-error').textContent = errors.name;
        document.getElementById('email-error').textContent = errors.email;
        submitError.textContent = errors.submit;

        if (errors.name) {
            nameInput.classList.add('error');
        } else {
            nameInput.classList.remove('error');
        }

        if (errors.email) {
            emailInput.classList.add('error');
        } else {
            emailInput.classList.remove('error');
        }
    };

    const handleInputChange = (e) => {
        updateFormData();
        // Clear specific error when user starts typing
        if (e.target.name === 'name' && errors.name) {
            errors.name = '';
            displayErrors();
        }
        if (e.target.name === 'email' && errors.email) {
            errors.email = '';
            displayErrors();
        }
    };

    const handleInterestChange = () => {
        updateFormData();
    };

    // Function to send confirmation email/notification to admin
    const sendAdminNotification = async (submissionData) => {
        // This would typically send an email or webhook to notify you
        // For now, we'll log to console and save to localStorage for demo
        const timestamp = new Date().toISOString();
        const submission = {
            ...submissionData,
            timestamp,
            id: Date.now().toString()
        };

        // Save to localStorage (in production, this would be sent to your backend)
        const existingSubmissions = JSON.parse(localStorage.getItem('betaSubmissions') || '[]');
        existingSubmissions.push(submission);
        localStorage.setItem('betaSubmissions', JSON.stringify(existingSubmissions));

        // Log for admin visibility
        console.log('🎉 NEW BETA SUBMISSION RECEIVED!');
        console.log('Submission Details:', submission);
        console.log('Total Submissions:', existingSubmissions.length);

        // In production, you would send this to your backend/email service
        // Example webhook call (commented out):
        /*
        try {
            // Replace with your actual webhook URL
            await fetch('https://your-backend.com/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission)
            });
        } catch (error) {
            console.error('Failed to send webhook:', error);
        }
        */

        return submission;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateFormData();

        if (!validateForm()) {
            return;
        }

        submitButton.disabled = true;
        submitButtonText.textContent = 'Joining Beta...';
        loadingSpinner.classList.remove('hidden');
        submitError.textContent = '';

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Send admin notification
            const submission = await sendAdminNotification(formData);

            // Show success state
            formMainContent.classList.add('hidden');
            formSuccessState.classList.remove('hidden');

            // Send message to parent window (if in iframe)
            if (window.parent !== window) {
                window.parent.postMessage('beta-form-success', '*');
            }

            // Show browser notification if permission granted
            // Handle notification permissions
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification('GhostDevs Beta Submission', {
                        body: `New beta signup from ${formData.name}`,
                        icon: '/ghost_logo_transparent-removebg-preview.png'
                    });
                } else if (Notification.permission !== 'denied') {
                    // Try to request permission again
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('GhostDevs Beta Submission', {
                                body: `New beta signup from ${formData.name}`,
                                icon: '/ghost_logo_transparent-removebg-preview.png'
                            });
                        }
                    });
                }
            }

            // Auto close after success message
            setTimeout(() => {
                formSuccessState.classList.add('hidden');
                formMainContent.classList.remove('hidden');
                form.reset();
                formData.interests = [];
                displayErrors();
                submitButton.disabled = false;
                submitButtonText.textContent = 'Join Beta Program';
                loadingSpinner.classList.add('hidden');
            }, 5000); // Extended to 5 seconds to show success longer

        } catch (err) {
            console.error('Error submitting form:', err);
            errors.submit = 'An unexpected error occurred. Please try again.';
            displayErrors();
        } finally {
            submitButton.disabled = false;
            submitButtonText.textContent = 'Join Beta Program';
            loadingSpinner.classList.add('hidden');
        }
    };

    // Event Listeners
    nameInput.addEventListener('input', handleInputChange);
    emailInput.addEventListener('input', handleInputChange);
    commentsTextarea.addEventListener('input', handleInputChange);
    referralSourceSelect.addEventListener('change', handleInputChange);
    interestsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleInterestChange);
    });
    form.addEventListener('submit', handleSubmit);

    // Close button functionality
    closeFormButton.addEventListener('click', () => {
        if (window.parent !== window) {
            window.parent.postMessage('beta-form-close', '*');
        } else {
            document.querySelector('.form-container-wrapper').classList.add('hidden');
        }
    });

    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Initial update of form data
    updateFormData();

    // Add admin panel functionality
    window.viewBetaSubmissions = () => {
        const submissions = JSON.parse(localStorage.getItem('betaSubmissions') || '[]');
        console.log('📊 BETA SUBMISSIONS DASHBOARD');
        console.log('Total Submissions:', submissions.length);
        console.table(submissions);
        return submissions;
    };

    // Add this to global scope for easy access
    window.getBetaSubmissionCount = () => {
        const submissions = JSON.parse(localStorage.getItem('betaSubmissions') || '[]');
        return submissions.length;
    };
});
