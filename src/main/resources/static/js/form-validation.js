class FormValidator {
    constructor() {
        this.validators = new Map();
        this.init();
    }

    init() {
        this.setupDefaultValidators();
        this.setupEventListeners();
    }

    setupDefaultValidators() {
        this.addValidator('required', (value, element) => {
            return value.trim() !== '';
        }, 'This field is required');

        this.addValidator('email', (value, element) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        }, 'Please enter a valid email address');

        this.addValidator('minLength', (value, element) => {
            const minLength = parseInt(element.getAttribute('data-min-length')) || 0;
            return value.length >= minLength;
        }, (element) => {
            const minLength = element.getAttribute('data-min-length');
            return `Minimum length is ${minLength} characters`;
        });

        this.addValidator('maxLength', (value, element) => {
            const maxLength = parseInt(element.getAttribute('data-max-length')) || Infinity;
            return value.length <= maxLength;
        }, (element) => {
            const maxLength = element.getAttribute('data-max-length');
            return `Maximum length is ${maxLength} characters`;
        });

        this.addValidator('pattern', (value, element) => {
            const pattern = element.getAttribute('data-pattern');
            if (!pattern) return true;
            const regex = new RegExp(pattern);
            return regex.test(value);
        }, 'Please match the required format');

        this.addValidator('number', (value, element) => {
            return !isNaN(value) && !isNaN(parseFloat(value));
        }, 'Please enter a valid number');

        this.addValidator('min', (value, element) => {
            const min = parseFloat(element.getAttribute('data-min'));
            const numValue = parseFloat(value);
            return isNaN(min) || isNaN(numValue) || numValue >= min;
        }, (element) => {
            const min = element.getAttribute('data-min');
            return `Value must be at least ${min}`;
        });

        this.addValidator('max', (value, element) => {
            const max = parseFloat(element.getAttribute('data-max'));
            const numValue = parseFloat(value);
            return isNaN(max) || isNaN(numValue) || numValue <= max;
        }, (element) => {
            const max = element.getAttribute('data-max');
            return `Value must be at most ${max}`;
        });

        this.addValidator('phone', (value, element) => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }, 'Please enter a valid phone number');

        this.addValidator('url', (value, element) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }, 'Please enter a valid URL');

        this.addValidator('date', (value, element) => {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }, 'Please enter a valid date');

        this.addValidator('match', (value, element) => {
            const targetSelector = element.getAttribute('data-match');
            if (!targetSelector) return true;
            const targetElement = document.querySelector(targetSelector);
            return targetElement && value === targetElement.value;
        }, 'Fields do not match');
    }

    setupEventListeners() {
        document.addEventListener('input', (e) => {
            if (e.target.hasAttribute('data-validate')) {
                this.validateField(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.hasAttribute('data-validate')) {
                this.validateField(e.target);
            }
        });

        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.hasAttribute('data-validate-form')) {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    }

    addValidator(name, validatorFn, errorMessage) {
        this.validators.set(name, {
            validate: validatorFn,
            message: errorMessage
        });
    }

    validateField(element) {
        const validationRules = element.getAttribute('data-validate').split('|');
        const value = element.value;
        let isValid = true;
        let errorMessage = '';

        for (const rule of validationRules) {
            const [validatorName, ...params] = rule.split(':');
            const validator = this.validators.get(validatorName);

            if (!validator) {
                console.warn(`Unknown validator: ${validatorName}`);
                continue;
            }

            if (!validator.validate(value, element, params)) {
                isValid = false;
                errorMessage = typeof validator.message === 'function' 
                    ? validator.message(element, params)
                    : validator.message;
                break;
            }
        }

        this.updateFieldValidation(element, isValid, errorMessage);
        return isValid;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    updateFieldValidation(element, isValid, errorMessage = '') {
        this.clearFieldError(element);

        if (isValid) {
            element.classList.remove('border-red-500', 'border-red-300');
            element.classList.add('border-green-500');
        } else {
            element.classList.remove('border-green-500');
            element.classList.add('border-red-500');
            this.showFieldError(element, errorMessage);
        }
    }

    showFieldError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-xs mt-1';
        errorDiv.textContent = message;

        const parent = element.parentNode;
        parent.appendChild(errorDiv);
    }

    clearFieldError(element) {
        const parent = element.parentNode;
        const existingError = parent.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    clearFormErrors(form) {
        const errors = form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());

        const fields = form.querySelectorAll('[data-validate]');
        fields.forEach(field => {
            field.classList.remove('border-red-500', 'border-green-500');
        });
    }

    addCustomValidator(name, validatorFn, errorMessage) {
        this.addValidator(name, validatorFn, errorMessage);
    }
}

window.formValidator = new FormValidator();