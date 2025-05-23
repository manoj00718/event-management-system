import { toast } from 'react-toastify';

/**
 * Centralized error handler for API requests
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Options for error handling
 * @param {string} options.fallbackMessage - Message to show if no specific error is available
 * @param {boolean} options.silent - If true, no toast notification will be shown
 * @param {Function} options.onNetworkError - Callback for network errors
 * @returns {Object} Structured error information
 */
export const handleApiError = (error, options = {}) => {
  const {
    fallbackMessage = 'An error occurred',
    silent = false,
    onNetworkError = null
  } = options;

  // Default error response
  const errorResponse = {
    message: fallbackMessage,
    status: 500,
    data: null,
    isNetworkError: false
  };

  // Axios error with response
  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.data = error.response.data;
    
    // Get appropriate error message
    if (error.response.data && error.response.data.message) {
      errorResponse.message = error.response.data.message;
    } else if (error.response.data && error.response.data.error) {
      errorResponse.message = error.response.data.error;
    } else if (error.response.status === 404) {
      errorResponse.message = 'The requested resource was not found';
    } else if (error.response.status === 401) {
      errorResponse.message = 'You need to login to access this resource';
    } else if (error.response.status === 403) {
      errorResponse.message = 'You do not have permission to perform this action';
    } else if (error.response.status >= 500) {
      errorResponse.message = 'Server error. Please try again later.';
    }
  } 
  // Network error (server not available)
  else if (error.request) {
    errorResponse.isNetworkError = true;
    errorResponse.message = 'Network error. Server may be unavailable.';
    
    // Call network error callback if provided
    if (onNetworkError && typeof onNetworkError === 'function') {
      onNetworkError();
    }
  }
  
  // Show toast notification unless silent option is true
  if (!silent) {
    if (errorResponse.isNetworkError) {
      toast.info('Using demo data as the server is not available', {
        autoClose: 5000,
        hideProgressBar: false
      });
    } else {
      toast.error(errorResponse.message, {
        autoClose: 5000,
        hideProgressBar: false
      });
    }
  }
  
  return errorResponse;
};

/**
 * Utility to safely handle API requests with fallback to mock data
 * @param {Function} apiCall - The API function to call
 * @param {Object} mockData - Mock data to use if API fails
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response data or mock data
 */
export const safeApiCall = async (apiCall, mockData, options = {}) => {
  const {
    fallbackMessage = 'Operation failed',
    silent = false,
    transformResponse = data => data,
    onSuccess = null,
    onError = null,
    onNetworkError = null
  } = options;
  
  try {
    const response = await apiCall();
    const transformedData = transformResponse(response.data);
    
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(transformedData);
    }
    
    return {
      data: transformedData,
      isSuccess: true,
      isError: false,
      isMockData: false
    };
  } catch (error) {
    const errorInfo = handleApiError(error, {
      fallbackMessage,
      silent,
      onNetworkError
    });
    
    if (onError && typeof onError === 'function') {
      onError(errorInfo);
    }
    
    return {
      data: mockData,
      isSuccess: false,
      isError: true,
      isMockData: true,
      error: errorInfo
    };
  }
};

/**
 * Creates a unique error ID for tracking
 * @returns {string} Unique error ID
 */
export const generateErrorId = () => {
  return Math.random().toString(36).substring(2, 15);
}; 