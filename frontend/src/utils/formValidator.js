/**
 * Production-Level Form Validation and Accessibility Checker
 * Runs automatic checks on all forms in the application
 */

class FormValidator {
  /**
   * Initialize form validation on component mount
   */
  static initializeValidation() {
    if (process.env.NODE_ENV === 'development') {
      this.checkAllForms();
    }
  }

  /**
   * Check all forms for accessibility and validation issues
   */
  static checkAllForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      console.group(`🔍 Checking Form ${index + 1}:`);
      
      const issues = [];
      
      // Check all form inputs
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach((input) => {
        // 1. Check for id attribute
        if (!input.id) {
          issues.push(`❌ ${input.name || input.type} missing id attribute`);
        }
        
        // 2. Check for name attribute
        if (!input.name) {
          issues.push(`❌ Input missing name attribute`);
        }
        
        // 3. Check for associated label
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          issues.push(`❌ ${input.id || input.name} has no associated label`);
        }
        
        // 4. Check aria-required for required fields
        if (input.required && !input.getAttribute('aria-required')) {
          issues.push(`⚠️  ${input.id || input.name} is required but missing aria-required`);
        }
        
        // 5. Check aria-invalid for fields with error
        if (input.classList.contains('error') && !input.getAttribute('aria-invalid')) {
          issues.push(`⚠️  ${input.id || input.name} has error but missing aria-invalid`);
        }
      });
      
      if (issues.length === 0) {
        console.log('✅ All checks passed!');
      } else {
        issues.forEach(issue => console.log(issue));
      }
      
      console.groupEnd();
    });
  }

  /**
   * Validate individual form input
   */
  static validateInput(input) {
    const errors = [];
    
    // Check type-specific validations
    switch (input.type) {
      case 'email':
        if (input.value && !this.isValidEmail(input.value)) {
          errors.push('Invalid email format');
        }
        break;
      
      case 'password':
        if (input.value && input.value.length < 6) {
          errors.push('Password must be at least 6 characters');
        }
        break;
      
      case 'text':
        if (input.required && !input.value.trim()) {
          errors.push(`${input.getAttribute('aria-label')} is required`);
        }
        break;
      
      default:
        if (input.required && !input.value) {
          errors.push('This field is required');
        }
    }
    
    // Update aria-invalid state
    if (errors.length > 0) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${input.id}-error`);
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    
    return errors;
  }

  /**
   * Validate entire form
   */
  static validateForm(form) {
    const inputs = form.querySelectorAll('[required]');
    const errors = {};
    
    inputs.forEach((input) => {
      const fieldErrors = this.validateInput(input);
      if (fieldErrors.length > 0) {
        errors[input.name] = fieldErrors;
      }
    });
    
    return Object.keys(errors).length === 0 ? null : errors;
  }

  /**
   * Email validation
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Display error messages with accessibility
   */
  static displayError(input, message) {
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.role = 'alert';
      errorElement.className = 'form-error';
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
  }

  /**
   * Clear error messages
   */
  static clearError(input) {
    const errorId = `${input.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  /**
   * Setup real-time validation
   */
  static setupRealtimeValidation(input, validationFn) {
    input.addEventListener('blur', () => {
      const errors = validationFn(input.value);
      if (errors && errors.length > 0) {
        this.displayError(input, errors[0]);
      } else {
        this.clearError(input);
      }
    });
    
    input.addEventListener('input', () => {
      const errors = validationFn(input.value);
      if (errors && errors.length === 0) {
        this.clearError(input);
      }
    });
  }
}

export default FormValidator;
