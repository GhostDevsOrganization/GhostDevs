import { supabase } from '../../config/supabase.js';

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

    const interestOptions = [
        'Token Swapping',
        'Cross-Chain Trading',
        'Advanced Analytics',
        'Portfolio Management',
        'DeFi Integration',
        'Mobile Trading',
        'Research Tools',
        'Community Features'
    ];

    const referralSources = [
        'Social Media',
        'Search Engine',
        'Friend/Colleague',
        'Crypto Community',
        'News Article',
        'Other'
    ];

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateFormData();

        if (!validateForm()) {
            return;
        }

        submitButton.disabled = true;
        submitButtonText.textContent = 'Joining Beta...';
        loadingSpinner.classList.remove('hidden');
        submitError.textContent = ''; // Clear previous submission errors

        try {
            const { data, error } = await supabase
                .from('beta_submissions')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    interests: formData.interests,
                    referral_source: formData.referralSource,
                    comments: formData.comments
                }]);

            if (error) {
                if (error.code === '23505' && error.details.includes('email')) {
                    errors.email = 'This email is already registered for beta access.';
                } else {
                    errors.submit = 'Something went wrong. Please try again.';
                }
                displayErrors();
                console.error('Supabase submission error:', error);
                return; // Stop execution if there's a Supabase error
            }

            console.log('Successfully saved to Supabase:', data);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            formMainContent.classList.add('hidden');
            formSuccessState.classList.remove('hidden');

            // Send message to parent window (if in iframe)
            if (window.parent !== window) {
                window.parent.postMessage('beta-form-success', '*');
            }

            // Auto close after success message
            setTimeout(() => {
                // In a real scenario, you might want to redirect or close a modal
                // For this standalone form, we'll just reset it
                formSuccessState.classList.add('hidden');
                formMainContent.classList.remove('hidden');
                form.reset(); // Reset form fields
                formData.interests = []; // Clear interests
                displayErrors(); // Clear any remaining errors
                submitButton.disabled = false;
                submitButtonText.textContent = 'Join Beta Program';
                loadingSpinner.classList.add('hidden');
            }, 3000);

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

    // Close button functionality (if used in a modal)
    closeFormButton.addEventListener('click', () => {
        // This would typically trigger a parent function to hide the modal
        // For now, we'll just log a message
        console.log('Close form button clicked');
        // You might want to hide the form-container-wrapper here
        document.querySelector('.form-container-wrapper').classList.add('hidden');
    });

    // Initial update of form data
    updateFormData();
});
