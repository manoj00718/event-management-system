import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Events.css';

// Sample events for when backend is not available
const SAMPLE_EVENTS = [
  {
    _id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations',
    date: new Date('2024-06-15T09:00:00Z'),
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
    }
  },
  {
    _id: '2',
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies and tools',
    date: new Date('2024-07-20T13:00:00Z'),
    location: 'Business Center',
    capacity: 50,
    price: 149.99,
    category: 'workshop',
    status: 'upcoming',
    tags: ['marketing', 'digital', 'business'],
    attendees: [],
    image: {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Digital Marketing Workshop'
    }
  },
  {
    _id: '3',
    title: 'Web Development Bootcamp',
    description: 'Intensive 2-day bootcamp covering modern web development technologies',
    date: new Date('2024-07-01T09:00:00Z'),
    location: 'Code Academy',
    capacity: 30,
    price: 199.99,
    category: 'workshop',
    status: 'upcoming',
    tags: ['web development', 'javascript', 'react', 'nodejs'],
    attendees: [],
    image: {
      url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      alt: 'Web Development Workshop'
    }
  },
  {
    _id: '4',
    title: 'Women in Tech Meetup',
    description: 'Networking event celebrating women in technology',
    date: new Date('2024-07-25T18:00:00Z'),
    location: 'Tech Hub',
    capacity: 120,
    price: 0,
    category: 'networking',
    status: 'upcoming',
    tags: ['women in tech', 'networking', 'technology', 'diversity'],
    attendees: [],
    image: {
      url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
      alt: 'Women in Tech Event'
    }
  }
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    date: '',
    search: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [filters.category, filters.date, filters.status]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = {};
      
      if (filters.category) queryParams.category = filters.category;
      if (filters.date) queryParams.date = filters.date;
      if (filters.search) queryParams.search = filters.search;
      if (filters.status) queryParams.status = filters.status;

      const response = await api.events.getAll(queryParams);
      setEvents(response.data.events || []);
      setUseMockData(false);
    } catch (error) {
      console.error('Failed to fetch events from API:', error);
      // Use mock data if API fails
      setEvents(SAMPLE_EVENTS);
      setUseMockData(true);
      
      if (!useMockData) {
        toast.info('Using demo data as the server is not available', {
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchTerm(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const handleCreateEvent = () => {
    if (!user) {
      toast.info('Please login to create an event');
      navigate('/login');
      return;
    }
    
    if (user.role === 'user') {
      toast.info('You need an organizer account to create events');
      return;
    }
    
    navigate('/events/create');
  };

  const categories = ['All', 'Conference', 'Workshop', 'Seminar', 'Networking', 'Other'];
  const statuses = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
  
  const clearFilters = () => {
    setFilters({
      category: '',
      date: '',
      search: '',
      status: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="page-title">
          <h1>Discover Events</h1>
          <p className="subtitle">Find amazing events happening around you</p>
        </div>
        
        <button 
          className="create-event-btn"
          onClick={handleCreateEvent}
        >
          <FontAwesomeIcon icon="calendar-plus" /> Create Event
        </button>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <FontAwesomeIcon icon="search" className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search for events..."
              value={searchTerm}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">
            <FontAwesomeIcon icon="search" /> Search
          </button>
        </form>

        <div className="filter-controls">
          <div className="filter-control">
            <label>Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All' ? '' : category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {statuses.map(status => (
                <option key={status} value={status === 'All' ? '' : status.toLowerCase()}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="date-filter"
            />
          </div>
          
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
            title="Clear all filters"
          >
            <FontAwesomeIcon icon="times" /> Clear
          </button>
        </div>
      </div>

      {useMockData && (
        <div className="mock-data-notice">
          <FontAwesomeIcon icon="exclamation-triangle" />
          <span>Using demo data for preview. Connect to server for real data.</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
          <p>Loading events...</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <div className="no-events">
              <FontAwesomeIcon icon="calendar-times" className="no-events-icon" />
              <h3>No events found</h3>
              <p>Try adjusting your filters or create a new event</p>
              <button 
                onClick={clearFilters}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events; 