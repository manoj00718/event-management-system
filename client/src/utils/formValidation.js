export const validateRequired = (value) => {
  if (!value || value.trim() === '') {
    return 'This field is required';
  }
  return '';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return '';
};

export const validateDate = (date) => {
  if (!date) {
    return 'Date is required';
  }
  const selectedDate = new Date(date);
  const now = new Date();
  if (selectedDate < now) {
    return 'Date must be in the future';
  }
  return '';
};

export const validateCapacity = (capacity) => {
  if (!capacity) {
    return 'Capacity is required';
  }
  const cap = parseInt(capacity);
  if (isNaN(cap) || cap <= 0) {
    return 'Capacity must be a positive number';
  }
  return '';
};

export const validatePrice = (price) => {
  if (!price) {
    return 'Price is required';
  }
  const p = parseFloat(price);
  if (isNaN(p) || p < 0) {
    return 'Price must be a non-negative number';
  }
  return '';
};

export const validateEventForm = (formData) => {
  const errors = {};

  const titleError = validateRequired(formData.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateRequired(formData.description);
  if (descriptionError) errors.description = descriptionError;

  const dateError = validateDate(formData.date);
  if (dateError) errors.date = dateError;

  const locationError = validateRequired(formData.location);
  if (locationError) errors.location = locationError;

  const capacityError = validateCapacity(formData.capacity);
  if (capacityError) errors.capacity = capacityError;

  const priceError = validatePrice(formData.price);
  if (priceError) errors.price = priceError;

  const categoryError = validateRequired(formData.category);
  if (categoryError) errors.category = categoryError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 