// Intercept fetch calls for component HTML files to handle subdirectory paths correctly.
// This resolves the dynamic component paths for navbar, footer, and auth-popup on this page.
(function() {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        let url = typeof input === "string" ? input : (input && input.url);
        if (typeof url === "string") {
            let targetUrl = url;
            if (targetUrl.startsWith("components/")) {
                targetUrl = "/" + targetUrl;
            } else if (targetUrl.includes("pages/components/")) {
                targetUrl = targetUrl.replace("pages/components/", "components/");
            }
            
            if (typeof input === "string") {
                input = targetUrl;
            } else {
                input = new Request(targetUrl, input);
            }
        }
        return originalFetch(input, init);
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    // Select elements
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");

    // Modal elements
    const successModal = document.getElementById("successModal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalName = document.getElementById("modal-name");
    const modalEmail = document.getElementById("modal-email");
    const modalSubject = document.getElementById("modal-subject");
    const modalMessage = document.getElementById("modal-message");

    // Track if form was submitted at least once (to enable real-time/live validation)
    let submitAttempted = false;

    // Helper functions for validation
    const validators = {
        name: (value) => {
            const trimmed = value.trim();
            if (trimmed === "") {
                return "Full name is required.";
            }
            if (trimmed.length < 2) {
                return "Name must be at least 2 characters long.";
            }
            // Alphabetic characters, spaces, and hyphens/apostrophes only
            const regex = /^[a-zA-Z\s'\-]+$/;
            if (!regex.test(trimmed)) {
                return "Name can only contain letters, spaces, hyphens, and apostrophes.";
            }
            return ""; // valid
        },
        email: (value) => {
            const trimmed = value.trim();
            if (trimmed === "") {
                return "Email address is required.";
            }
            // Standard RFC 5322 email validation regex
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!regex.test(trimmed)) {
                return "Please enter a valid email address.";
            }
            return ""; // valid
        },
        subject: (value) => {
            const trimmed = value.trim();
            if (trimmed === "") {
                return "Subject is required.";
            }
            if (trimmed.length < 4) {
                return "Subject must be at least 4 characters long.";
            }
            return ""; // valid
        },
        message: (value) => {
            const trimmed = value.trim();
            if (trimmed === "") {
                return "Message is required.";
            }
            if (trimmed.length < 10) {
                return "Message must be at least 10 characters long.";
            }
            return ""; // valid
        }
    };

    /**
     * Validates a single form field and updates its UI state.
     * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element to validate.
     * @param {string} fieldName - The name of the field (key in validators object).
     * @returns {boolean} - True if valid, false otherwise.
     */
    function validateField(input, fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const value = input.value;
        const errorMessage = validators[fieldName](value);
        const formGroup = input.closest(".form-group");

        if (errorMessage) {
            formGroup.classList.remove("valid");
            formGroup.classList.add("invalid");
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
            return false;
        } else {
            formGroup.classList.remove("invalid");
            formGroup.classList.add("valid");
            if (errorElement) {
                errorElement.textContent = "";
            }
            return true;
        }
    }

    // Attach event listeners for real-time validation (on input & blur)
    const formFields = [
        { element: nameInput, name: "name" },
        { element: emailInput, name: "email" },
        { element: subjectInput, name: "subject" },
        { element: messageInput, name: "message" }
    ];

    formFields.forEach(field => {
        // Validation on Blur
        field.element.addEventListener("blur", () => {
            // Validate on blur if the user has input something or has tried to submit the form
            if (submitAttempted || field.element.value.trim() !== "") {
                validateField(field.element, field.name);
            }
        });

        // Live validation while typing, but only after first submit attempt or if it's already marked invalid
        field.element.addEventListener("input", () => {
            const formGroup = field.element.closest(".form-group");
            if (submitAttempted || formGroup.classList.contains("invalid")) {
                validateField(field.element, field.name);
            }
        });
    });

    // Handle Form Submission
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        submitAttempted = true;

        let isFormValid = true;

        // Validate all fields
        formFields.forEach(field => {
            const isValid = validateField(field.element, field.name);
            if (!isValid) {
                isFormValid = false;
            }
        });

        // If validation fails, focus on the first invalid input element
        if (!isFormValid) {
            const firstInvalidInput = contactForm.querySelector(".form-group.invalid input, .form-group.invalid textarea");
            if (firstInvalidInput) {
                firstInvalidInput.focus();
            }
            return;
        }

        // Gather Form Data
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Store submitted metadata in localStorage (for demo purposes)
        try {
            const existingSubmissions = JSON.parse(localStorage.getItem("pte_contact_submissions")) || [];
            existingSubmissions.push(formData);
            localStorage.setItem("pte_contact_submissions", JSON.stringify(existingSubmissions));
        } catch (error) {
            console.error("Error writing to localStorage:", error);
        }

        // Populate Success Modal Details
        modalName.textContent = formData.name;
        modalEmail.textContent = formData.email;
        modalSubject.textContent = formData.subject;
        modalMessage.textContent = formData.message;

        // Show Success Modal
        successModal.classList.add("active");

        // Reset the form state
        contactForm.reset();
        submitAttempted = false;

        // Remove success classes from all form-groups
        formFields.forEach(field => {
            const formGroup = field.element.closest(".form-group");
            formGroup.classList.remove("valid", "invalid");
        });
    });

    // Close Modal Event Handlers
    function closeModal() {
        successModal.classList.remove("active");
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeModal);
    }

    // Close modal when clicking on background overlay
    successModal.addEventListener("click", (e) => {
        if (e.target === successModal) {
            closeModal();
        }
    });

    // Close modal on escape key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && successModal.classList.contains("active")) {
            closeModal();
        }
    });
});
