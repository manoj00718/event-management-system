import { toast } from 'react-toastify';

/**
 * Safely executes an API call and handles common errors
 * @param {Function} apiCall - The async API function to call
 * @param {Object} options - Options for the API call
 * @param {string} options.errorMessage - Custom error message to display
 * @param {Function} options.onSuccess - Callback for successful API call
 * @param {Function} options.onError - Callback for API call error
 * @param {boolean} options.showSuccessToast - Whether to show a success toast
 * @param {string} options.successMessage - Custom success message
 * @returns {Promise<any>} - The API response data or null if error
 */
export const safeApiCall = async (apiCall, options = {}) => {
  const {
    errorMessage = 'An error occurred. Please try again.',
    onSuccess,
    onError,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully'
  } = options;

  try {
    const response = await apiCall();
    
    if (showSuccessToast) {
      toast.success(successMessage);
    }
    
    if (onSuccess) {
      onSuccess(response);
    }
    
    return response;
  } catch (error) {
    const message = error.response?.data?.message || errorMessage;
    toast.error(message);
    
    if (onError) {
      onError(error);
    }
    
    return null;
  }
}; 