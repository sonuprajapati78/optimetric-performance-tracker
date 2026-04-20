/**
 * Production-Level Form Accessibility Standards
 * Ensures WCAG 2.1 AA compliance across all forms
 */

export const formAccessibilityStandards = {
  /**
   * Every form input MUST have:
   * 1. id attribute (unique)
   * 2. name attribute
   * 3. associated label with htmlFor
   * 4. aria-label or aria-labelledby
   * 5. aria-required if required
   * 6. aria-describedby for help text
   */

  formElements: {
    textInput: {
      required: ['id', 'name', 'type', 'label'],
      optional: ['placeholder', 'maxLength', 'pattern'],
      aria: ['aria-required', 'aria-label', 'aria-describedby'],
      example: `
        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            aria-required="true"
            aria-label="Username input field"
            aria-describedby="username-help"
          />
          <small id="username-help">Must be 3-20 characters</small>
        </div>
      `,
    },

    select: {
      required: ['id', 'name', 'label'],
      optional: ['defaultValue', 'multiple'],
      aria: ['aria-required', 'aria-label', 'aria-describedby'],
      example: `
        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            name="country"
            required
            aria-required="true"
            aria-label="Select your country"
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
      `,
    },

    checkbox: {
      required: ['id', 'name', 'type'],
      optional: [],
      aria: ['aria-required', 'aria-label'],
      example: `
        <div className="form-group">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            aria-required="true"
          />
          <label htmlFor="terms">I agree to the terms and conditions *</label>
        </div>
      `,
    },

    textarea: {
      required: ['id', 'name', 'label'],
      optional: ['rows', 'cols', 'maxLength'],
      aria: ['aria-required', 'aria-label', 'aria-describedby'],
      example: `
        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            required
            aria-required="true"
            aria-label="Message text area"
            aria-describedby="message-count"
          />
          <small id="message-count">Max 500 characters</small>
        </div>
      `,
    },
  },

  /**
   * Form validation checklist
   */
  validationChecklist: [
    '✅ Every input has unique id attribute',
    '✅ Every input has name attribute',
    '✅ Every input has associated label with htmlFor',
    '✅ Required fields have aria-required="true"',
    '✅ Required fields marked with * in label text',
    '✅ Form has noValidate if using custom validation',
    '✅ Error messages have role="alert"',
    '✅ Success messages have role="status"',
    '✅ Disabled fields have disabled attribute',
    '✅ Read-only fields have readOnly attribute',
    '✅ Form submission feedback provided',
    '✅ Focus management implemented',
  ],

  /**
   * Aria attributes for forms
   */
  ariaAttributes: {
    'aria-required': 'true/false - Indicates field is required',
    'aria-invalid': 'true/false - Indicates field validation error',
    'aria-describedby': 'id - Links to help text or error message',
    'aria-label': 'string - Provides accessible label for input',
    'aria-labelledby': 'id - Links to element that labels this field',
    'role="alert"': 'Announces error messages immediately',
    'role="status"': 'Announces success messages',
  },

  /**
   * CSS selectors for testing
   */
  testingSelectors: {
    requiredInputs: 'input[required], select[required], textarea[required]',
    inputsWithoutId: 'input:not([id]), select:not([id]), textarea:not([id])',
    inputsWithoutLabel: 'input:not([aria-label])[name]',
    labelsWithoutFor: 'label:not([htmlFor])',
  },

  /**
   * Production verification script
   * Run this in browser console to check form compliance
   */
  verificationScript: `
    // Check for inputs without id
    const inputsWithoutId = document.querySelectorAll('input:not([id]), select:not([id]), textarea:not([id])');
    if (inputsWithoutId.length > 0) {
      console.warn('❌ Found', inputsWithoutId.length, 'inputs without id attribute');
    }

    // Check for labels without htmlFor
    const labelsWithoutFor = document.querySelectorAll('label:not([for])');
    if (labelsWithoutFor.length > 0) {
      console.warn('❌ Found', labelsWithoutFor.length, 'labels without htmlFor attribute');
    }

    // Check required inputs
    const requiredInputs = document.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (!input.getAttribute('aria-required')) {
        console.warn('❌ Required input missing aria-required:', input);
      }
    });

    console.log('✅ Form accessibility check completed');
  `,
};

export default formAccessibilityStandards;
