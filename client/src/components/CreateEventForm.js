import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    category: 'conference',
    imageAlt: '',
    tags: [],
    socialSharing: {
      enabled: true,
      platforms: ['facebook', 'twitter', 'linkedin'],
      customMessage: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData object for file upload
      const eventFormData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'tags' || key === 'socialSharing') {
          eventFormData.append(key, JSON.stringify(formData[key]));
        } else {
          eventFormData.append(key, formData[key]);
        }
      });
      
      // Add image file if selected
      if (imageFile) {
        eventFormData.append('image', imageFile);
      }

      const response = await axios.post(
        'http://localhost:5000/api/events',
        eventFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('🎉 Event created successfully! Redirecting to event page...');
      setTimeout(() => {
        navigate(`/events/${response.data._id}`);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Social media platform icons (corrected)
  const socialIcons = {
    facebook: ['fab', 'facebook-f'],
    twitter: ['fab', 'twitter'],
    linkedin: ['fab', 'linkedin-in']
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Event Image</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500"
            />
          </div>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Event Preview"
                className="h-40 object-cover rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image Alt Text</label>
            <input
              type="text"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleChange}
              placeholder="Descriptive text for the image"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Tags</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd();
                }
              }}
              placeholder="Add tags"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="inline-flex items-center justify-center p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Sharing Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Sharing</h3>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
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
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2">Enable Social Sharing</span>
            </label>
          </div>
          
          {formData.socialSharing.enabled && (
            <>
              <div className="flex space-x-4">
                {Object.entries(socialIcons).map(([platform, icon]) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handleSocialPlatformToggle(platform)}
                    className={`p-3 rounded-full flex items-center justify-center ${
                      formData.socialSharing.platforms.includes(platform)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <FontAwesomeIcon icon={icon} />
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Share Message</label>
                <textarea
                  name="socialSharing.customMessage"
                  value={formData.socialSharing.customMessage}
                  onChange={handleChange}
                  placeholder="Enter a custom message for social sharing"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mr-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm; 