import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/EventForm.css';

const EditEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    price: '',
    category: '',
    image: {
      url: '',
      alt: ''
    },
    tags: [],
    socialSharing: {
      enabled: true,
      platforms: ['facebook', 'twitter', 'linkedin'],
      customMessage: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      const event = response.data;
      
      // Format date for datetime-local input
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        ...event,
        date: formattedDate,
        image: event.image || { url: '', alt: '' },
        tags: event.tags || [],
        socialSharing: event.socialSharing || {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: ''
        }
      });
    } catch (error) {
      toast.error('Failed to fetch event details');
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

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
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/events/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      toast.success('🎉 Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update event';
      toast.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:5000/api/events/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        toast.success('Event deleted successfully');
        navigate('/events');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete event');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Event</h2>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete Event
          </button>
        </div>
        
        {error && <div className="error-message mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                name="image.url"
                value={formData.image.url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image Alt Text</label>
              <input
                type="text"
                name="image.alt"
                value={formData.image.alt}
                onChange={handleChange}
                placeholder="Description of the image"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Social Sharing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Sharing</h3>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.socialSharing.enabled}
                onChange={(e) => handleChange({
                  target: {
                    name: 'socialSharing.enabled',
                    value: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Enable social sharing</label>
            </div>
            {formData.socialSharing.enabled && (
              <>
                <div className="flex gap-4">
                  {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handleSocialPlatformToggle(platform)}
                      className={`px-4 py-2 rounded-md ${
                        formData.socialSharing.platforms.includes(platform)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
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
                    rows="2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/events/${id}`)}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent; 