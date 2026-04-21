/**
 * Production-Level Form Hook
 * Handles form state, validation, and accessibility
 */

import { useState, useCallback, useRef } from 'react';
import FormValidator from '../utils/formValidator';

/**
 * useForm Hook - Production-level form management
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Callback on successful form submission
 * @param {Object} validationRules - Custom validation rules
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, onSubmit, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  /**
   * Validate single field
   */
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    
    if (!rule) return null;
    
    // Run validation function or regex
    if (typeof rule === 'function') {
      return rule(value);
    } else if (rule instanceof RegExp) {
      return rule.test(value) ? null : `Invalid ${name}`;
    }
    
    return null;
  }, [validationRules]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(values).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  /**
   * Handle field change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error on change if previously touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, [validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      
      setIsSubmitting(true);
      
      try {
        // Validate form
        const isValid = validateForm();
        
        if (isValid) {
          // Mark all fields as touched
          const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          );
          setTouched(allTouched);
          
          // Call submit callback
          await onSubmit(values);
        } else {
          // Focus first error field
          const firstErrorField = formRef.current?.querySelector('[aria-invalid="true"]');
          firstErrorField?.focus();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Set field error (for server-side errors)
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    formRef,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldError,
  };
};

export default useForm;
