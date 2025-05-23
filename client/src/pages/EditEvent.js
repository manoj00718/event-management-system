import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import '../styles/EventForm.css';
import { safeApiCall } from '../utils/errorHandler';
import ErrorState from '../components/ErrorState';

// Sample event for when backend is not available
const SAMPLE_EVENT = {
  _id: '1',
  title: 'Tech Conference 2024',
  description: 'Annual technology conference featuring the latest innovations',
  date: new Date('2024-06-15T09:00:00Z').toISOString().slice(0, 16),
  location: 'Convention Center',
  capacity: 500,
  price: 299.99,
  category: 'conference',
  status: 'upcoming',
  tags: ['technology', 'innovation', 'networking'],
  attendees: [],
  image: {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    alt: 'Tech Conference Hall'
  },
  socialSharing: {
    enabled: true,
    platforms: ['facebook', 'twitter', 'linkedin'],
    customMessage: 'Join us at the biggest tech conference of 2024!'
  }
};

const EditEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    category: '',
    status: 'upcoming',
    imageAlt: '',
    tags: [],
    socialSharing: {
      enabled: true,
      platforms: ['facebook', 'twitter', 'linkedin'],
      customMessage: ''
    }
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user && user.role === 'user') {
      toast.error('You do not have permission to edit events');
      navigate('/events');
      return;
    }
    
    fetchEvent();
  }, [id, user, navigate]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      
      const { data, isMockData } = await safeApiCall(
        () => api.events.getById(id), 
        { ...SAMPLE_EVENT, _id: id },
        {
          onNetworkError: () => {
            setUseMockData(true);
          }
        }
      );
      
      // Format date for datetime-local input
      const event = data;
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        ...event,
        date: formattedDate,
        imageAlt: event.image?.alt || '',
        tags: event.tags || [],
        socialSharing: event.socialSharing || {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: ''
        }
      });

      // Set image preview if available
      if (event.image && event.image.url) {
        setImagePreview(event.image.url);
      }
      
      setUseMockData(isMockData);
      
      if (isMockData) {
        toast.info('Using demo data as the server is not available', {
          toastId: 'mock-data-notice', // Prevent duplicate toasts
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    
    if (!formData.capacity) {
      errors.capacity = 'Capacity is required';
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    
    if (formData.price === '') {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a non-negative number';
    }
    
    if (!formData.category) errors.category = 'Category is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and GIF formats are supported');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSocialPlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      socialSharing: {
        ...prev.socialSharing,
        platforms: prev.socialSharing.platforms.includes(platform)
          ? prev.socialSharing.platforms.filter(p => p !== platform)
          : [...prev.socialSharing.platforms, platform]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      if (useMockData) {
        // Simulate API call success
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
        return;
      }

      // Create FormData object for file upload
      const eventFormData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'tags' || key === 'socialSharing') {
          eventFormData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'image' && key !== '_id' && key !== '__v' && key !== 'organizer' && key !== 'attendees' && key !== 'waitlist' && key !== 'analytics' && key !== 'createdAt') {
          eventFormData.append(key, formData[key]);
        }
      });
      
      // Add image file if selected
      if (imageFile) {
        eventFormData.append('image', imageFile);
      }

      const { isSuccess, error } = await safeApiCall(
        () => api.events.update(id, eventFormData),
        null,
        {
          fallbackMessage: 'Failed to update event'
        }
      );

      if (isSuccess) {
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else if (error) {
        // Error is already handled by safeApiCall
        console.error('Update error:', error);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setDeleteLoading(true);
      
      try {
        if (useMockData) {
          // Simulate API call success
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('Event deleted successfully');
          navigate('/events');
          return;
        }
        
        const { isSuccess, error } = await safeApiCall(
          () => api.events.delete(id),
          null,
          {
            fallbackMessage: 'Failed to delete event'
          }
        );

        if (isSuccess) {
          toast.success('Event deleted successfully');
          navigate('/events');
        } else if (error) {
          // Error is already handled by safeApiCall
          console.error('Delete error:', error);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" />
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="event-form-header">
        <h1>Edit Event</h1>
        <button
          onClick={handleDelete}
          className="delete-event-btn"
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <>
              <LoadingSpinner size="small" color="white" /> Deleting...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon="trash-alt" /> Delete Event
            </>
          )}
        </button>
      </div>
      
      {useMockData && (
        <div className="mock-data-notice">
          <FontAwesomeIcon icon="exclamation-triangle" />
          <span>Using demo data for preview. Connect to server for real functionality.</span>
        </div>
      )}
      
      {Object.keys(formErrors).length > 0 && (
        <div className="form-errors-container">
          <div className="form-errors-header">
            <FontAwesomeIcon icon="exclamation-circle" /> Invalid updates
          </div>
          <ul className="form-errors-list">
            {Object.entries(formErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-section">
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <div className="field-error">{formErrors.title}</div>}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && <div className="field-error">{formErrors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Date</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={formErrors.date ? 'error' : ''}
              />
              {formErrors.date && <div className="field-error">{formErrors.date}</div>}
            </div>

            <div className="form-field">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={formErrors.location ? 'error' : ''}
              />
              {formErrors.location && <div className="field-error">{formErrors.location}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={formErrors.capacity ? 'error' : ''}
              />
              {formErrors.capacity && <div className="field-error">{formErrors.capacity}</div>}
            </div>

            <div className="form-field">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={formErrors.price ? 'error' : ''}
              />
              {formErrors.price && <div className="field-error">{formErrors.price}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={formErrors.category ? 'error' : ''}
              >
                <option value="">Select a category</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
              {formErrors.category && <div className="field-error">{formErrors.category}</div>}
            </div>

            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Event Image</h2>
          
          <div className="image-preview-container">
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Event preview" />
              </div>
            )}
            
            <div className="image-upload">
              <label htmlFor="image" className="upload-label">
                <FontAwesomeIcon icon="cloud-upload-alt" />
                <span>Upload New Image</span>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <p className="image-requirements">JPG, PNG, GIF up to 5MB</p>
            </div>
          </div>
          
          <div className="form-field">
            <label htmlFor="imageAlt">Image Alt Text</label>
            <input
              type="text"
              id="imageAlt"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleChange}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Tags</h2>
          <div className="tags-input-container">
            <div className="tags-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (press Enter to add)"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="add-tag-btn"
              >
                <FontAwesomeIcon icon="plus" />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map(tag => (
                  <div key={tag} className="tag">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="remove-tag-btn"
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Social Sharing</h2>
          <div className="social-sharing-container">
            <div className="form-field toggle-field">
              <label htmlFor="socialSharing.enabled">Enable Social Sharing</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="socialSharing.enabled"
                  name="socialSharing.enabled"
                  checked={formData.socialSharing.enabled}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      socialSharing: {
                        ...prev.socialSharing,
                        enabled: e.target.checked
                      }
                    }));
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {formData.socialSharing.enabled && (
              <>
                <div className="social-platforms">
                  <div className="platform-option">
                    <button
                      type="button"
                      className={`platform-btn ${formData.socialSharing.platforms.includes('facebook') ? 'active' : ''}`}
                      onClick={() => handleSocialPlatformToggle('facebook')}
                    >
                      <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                      <span>Facebook</span>
                    </button>
                  </div>
                  
                  <div className="platform-option">
                    <button
                      type="button"
                      className={`platform-btn ${formData.socialSharing.platforms.includes('twitter') ? 'active' : ''}`}
                      onClick={() => handleSocialPlatformToggle('twitter')}
                    >
                      <FontAwesomeIcon icon={['fab', 'twitter']} />
                      <span>Twitter</span>
                    </button>
                  </div>
                  
                  <div className="platform-option">
                    <button
                      type="button"
                      className={`platform-btn ${formData.socialSharing.platforms.includes('linkedin') ? 'active' : ''}`}
                      onClick={() => handleSocialPlatformToggle('linkedin')}
                    >
                      <FontAwesomeIcon icon={['fab', 'linkedin-in']} />
                      <span>LinkedIn</span>
                    </button>
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="socialSharing.customMessage">Custom Share Message</label>
                  <textarea
                    id="socialSharing.customMessage"
                    name="socialSharing.customMessage"
                    value={formData.socialSharing.customMessage}
                    onChange={handleChange}
                    placeholder="Enter a custom message for social sharing"
                    rows="3"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/events/${id}`)}
            className="cancel-btn"
          >
            <FontAwesomeIcon icon="times" /> Cancel
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <LoadingSpinner size="small" color="white" /> Updating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="save" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 