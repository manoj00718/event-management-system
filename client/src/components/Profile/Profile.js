import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { updateProfile, updateDisplayMode } from '../../utils/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, theme, updateTheme } = useUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      website: user?.socialLinks?.website || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const social = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [social]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateProfile(formData);
      updateUser(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleThemeChange = async (e) => {
    const newTheme = e.target.value;
    try {
      await updateDisplayMode(newTheme);
      updateTheme(newTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.profileImage.url} alt={user.profileImage.alt} className="profile-image" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-role">{user.role}</p>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="social-links">
            <h3>Social Links</h3>
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                type="url"
                id="linkedin"
                name="social.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="twitter">Twitter</label>
              <input
                type="url"
                id="twitter"
                name="social.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="social.website"
                value={formData.socialLinks.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Save Changes</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="profile-section">
            <h2>About</h2>
            <p>{user.bio || 'No bio added yet.'}</p>
          </div>

          <div className="profile-section">
            <h2>Location</h2>
            <p>{user.location || 'No location added yet.'}</p>
          </div>

          <div className="profile-section">
            <h2>Social Links</h2>
            <div className="social-links-list">
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              )}
              {user.socialLinks?.twitter && (
                <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              )}
              {user.socialLinks?.website && (
                <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              )}
            </div>
          </div>

          <button className="btn-primary" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      )}

      <div className="profile-preferences">
        <h2>Preferences</h2>
        <div className="form-group">
          <label htmlFor="theme">Display Theme</label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="profile-stats">
        <h2>Activity Stats</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{user.stats.eventsAttended}</span>
            <span className="stat-label">Events Attended</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.eventsOrganized}</span>
            <span className="stat-label">Events Organized</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.totalRatingsGiven}</span>
            <span className="stat-label">Ratings Given</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 