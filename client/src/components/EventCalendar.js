import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import './EventCalendar.css';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Get current date in YYYY-MM-DD format for the form
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'other',
    date: formattedToday,
    time: '12:00',
    location: '',
    description: '',
    price: 0,
    capacity: 50
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // First get events the user is registered for
      const token = localStorage.getItem('token');
      let registeredEvents = [];
      
      if (token) {
        try {
          console.log('Fetching registered events for calendar...');
          const registeredResponse = await axios.get('http://localhost:5000/api/profile/bookings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          registeredEvents = registeredResponse.data || [];
          console.log('Found registered events:', registeredEvents.length);
        } catch (error) {
          console.error('Error fetching registered events:', error);
          // Continue with empty registered events
        }
      }
      
      // Then get all public events
      const allEventsResponse = await axios.get('http://localhost:5000/api/events');
      const allEvents = allEventsResponse.data.events || [];
      console.log('Fetched all events:', allEvents.length);
      
      // Create a map of event IDs for registered events for faster lookup
      const registeredEventIds = new Set(registeredEvents.map(event => event._id));
      
      // Transform events to FullCalendar format
      const formattedEvents = allEvents.map(event => {
        // Check if this event is in the registered events
        const isRegistered = registeredEventIds.has(event._id);
        
        return {
          id: event._id,
          title: event.title,
          start: new Date(event.date),
          end: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), // Default 2 hours duration
          extendedProps: {
            description: event.description,
            location: event.location,
            category: event.category,
            status: event.status,
            price: event.price,
            capacity: event.capacity,
            attendees: event.attendees ? event.attendees.length : 0,
            isRegistered: isRegistered
          },
          backgroundColor: isRegistered ? '#8450E9' : getEventColor(event.category),
          borderColor: isRegistered ? '#8450E9' : getEventColor(event.category)
        };
      });
      
      // Add any registered events that weren't in the all events list
      registeredEvents.forEach(regEvent => {
        if (!allEvents.some(e => e._id === regEvent._id)) {
          formattedEvents.push({
            id: regEvent._id,
            title: regEvent.title,
            start: new Date(regEvent.date),
            end: new Date(new Date(regEvent.date).getTime() + 2 * 60 * 60 * 1000),
            extendedProps: {
              description: regEvent.description,
              location: regEvent.location,
              category: regEvent.category,
              status: regEvent.status,
              price: regEvent.price,
              capacity: regEvent.capacity,
              attendees: regEvent.attendees ? regEvent.attendees.length : 0,
              isRegistered: true
            },
            backgroundColor: '#8450E9', // Always use registered color
            borderColor: '#8450E9'
          });
        }
      });
      
      // If no events were found, create some sample events
      if (formattedEvents.length === 0) {
        const sampleEvents = createSampleEvents();
        formattedEvents.push(...sampleEvents);
        console.log('Added sample events:', sampleEvents.length);
      }
      
      console.log('Total events in calendar:', formattedEvents.length);
      setEvents(formattedEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      setLoading(false);
      console.error('Error fetching events:', err);
      
      // Add sample events if there was an error fetching real events
      const sampleEvents = createSampleEvents();
      setEvents(sampleEvents);
    }
  };
  
  const getEventColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'conference':
        return '#3788d8'; // blue
      case 'workshop':
        return '#28a745'; // green
      case 'seminar':
        return '#dc3545'; // red
      case 'networking':
        return '#fd7e14'; // orange
      default:
        return '#6c757d'; // gray
    }
  };
  
  const handleEventClick = (clickInfo) => {
    navigate(`/events/${clickInfo.event.id}`);
  };
  
  const handleDateClick = (dateInfo) => {
    if (!user) {
      toast.info('Please login to create an event');
      return;
    }
    
    if (user.role !== 'organizer' && user.role !== 'admin') {
      toast.info('You need an organizer account to create events');
      return;
    }
    
    // Format date for the form: YYYY-MM-DD
    const clickedDate = new Date(dateInfo.date);
    const formattedDate = clickedDate.toISOString().split('T')[0];
    
    setSelectedDate(clickedDate);
    setNewEvent(prev => ({
      ...prev,
      date: formattedDate
    }));
    
    setShowModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Combine date and time
      const dateTime = new Date(`${newEvent.date}T${newEvent.time}`);
      
      const eventData = {
        title: newEvent.title,
        category: newEvent.category,
        date: dateTime.toISOString(),
        location: newEvent.location,
        description: newEvent.description,
        price: parseFloat(newEvent.price) || 0,
        capacity: parseInt(newEvent.capacity) || 50
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/events',
        eventData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Event created successfully!');
      setShowModal(false);
      
      // Reset form with current date as default
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      setNewEvent({
        title: '',
        category: 'other',
        date: formattedDate,
        time: '12:00',
        location: '',
        description: '',
        price: 0,
        capacity: 50
      });
      
      // Add the new event to the calendar
      const newEventFormatted = {
        id: response.data._id,
        title: response.data.title,
        start: new Date(response.data.date),
        end: new Date(new Date(response.data.date).getTime() + 2 * 60 * 60 * 1000),
        extendedProps: {
          description: response.data.description,
          location: response.data.location,
          category: response.data.category,
          status: 'upcoming',
          price: response.data.price,
          capacity: response.data.capacity,
          attendees: 0
        },
        backgroundColor: getEventColor(response.data.category),
        borderColor: getEventColor(response.data.category)
      };
      
      setEvents(prev => [...prev, newEventFormatted]);
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.error || 'Failed to create event');
    }
  };
  
  const renderEventContent = (eventInfo) => {
    const { extendedProps } = eventInfo.event;
    const isPaid = extendedProps.price > 0;
    const isRegistered = extendedProps.isRegistered;
    
    return (
      <div className="fc-event-content">
        <div className="fc-event-title">
          {eventInfo.event.title}
          {isPaid && <span className="paid-badge">$</span>}
          {isRegistered && <span className="registered-badge">✓</span>}
        </div>
        <div className="fc-event-location">{extendedProps.location}</div>
        <div className="fc-event-attendees">
          {extendedProps.attendees}/{extendedProps.capacity} attendees
        </div>
      </div>
    );
  };

  // Modal for creating a new event
  const renderEventModal = () => {
    return (
      <div className={`event-modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="event-modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create New Event</h2>
            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newEvent.category}
                onChange={handleInputChange}
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newEvent.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={newEvent.capacity}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Function to create sample events with dates relative to the current date
  const createSampleEvents = () => {
    const today = new Date();
    const sampleEvents = [
      {
        id: 'sample-1',
        title: 'Tech Conference 2023',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 9, 0), // 5 days from now
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 17, 0),
        extendedProps: {
          description: 'Annual technology conference featuring the latest innovations',
          location: 'Convention Center',
          category: 'conference',
          status: 'upcoming',
          price: 299,
          capacity: 500,
          attendees: 325,
          isRegistered: false
        },
        backgroundColor: getEventColor('conference'),
        borderColor: getEventColor('conference')
      },
      {
        id: 'sample-2',
        title: 'Web Development Workshop',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0), // 2 days from now
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
        extendedProps: {
          description: 'Hands-on workshop covering modern web development techniques',
          location: 'Tech Hub',
          category: 'workshop',
          status: 'upcoming',
          price: 149,
          capacity: 30,
          attendees: 25,
          isRegistered: true
        },
        backgroundColor: '#8450E9', // Registered color
        borderColor: '#8450E9'
      },
      {
        id: 'sample-3',
        title: 'Business Networking Mixer',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 18, 0), // Tomorrow
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 21, 0),
        extendedProps: {
          description: 'Connect with local business leaders and entrepreneurs',
          location: 'Downtown Hotel',
          category: 'networking',
          status: 'upcoming',
          price: 0,
          capacity: 100,
          attendees: 45,
          isRegistered: false
        },
        backgroundColor: getEventColor('networking'),
        borderColor: getEventColor('networking')
      },
      {
        id: 'sample-4',
        title: 'AI in Healthcare Seminar',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 13, 0), // 7 days from now
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 17, 0),
        extendedProps: {
          description: 'Exploring the impact of artificial intelligence in modern healthcare',
          location: 'Medical Center Auditorium',
          category: 'seminar',
          status: 'upcoming',
          price: 75,
          capacity: 200,
          attendees: 120,
          isRegistered: false
        },
        backgroundColor: getEventColor('seminar'),
        borderColor: getEventColor('seminar')
      },
      {
        id: 'sample-5',
        title: 'Community Volunteer Day',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 9, 0), // 3 days from now
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 0),
        extendedProps: {
          description: 'Join us for a day of community service and giving back',
          location: 'City Park',
          category: 'other',
          status: 'upcoming',
          price: 0,
          capacity: 50,
          attendees: 32,
          isRegistered: true
        },
        backgroundColor: '#8450E9', // Registered color
        borderColor: '#8450E9'
      }
    ];
    
    return sampleEvents;
  };

  if (loading) {
    return (
      <div className="calendar-loading">
        <FontAwesomeIcon icon="spinner" spin />
        <span>Loading events calendar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-error">
        <FontAwesomeIcon icon="exclamation-triangle" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="event-calendar-container">
      <div className="calendar-header">
        <h2>Event Calendar</h2>
        <p>View and manage all your events in one place</p>
        
        <div className="calendar-actions">
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button className="add-event-btn" onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon="plus" /> Add Event
            </button>
          )}
          
          <button className="refresh-btn" onClick={fetchEvents}>
            <FontAwesomeIcon icon="sync" /> Refresh
          </button>
        </div>
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#3788d8' }}></div>
          <span>Conference</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#28a745' }}></div>
          <span>Workshop</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#dc3545' }}></div>
          <span>Seminar</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#fd7e14' }}></div>
          <span>Networking</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#8450E9' }}></div>
          <span>Registered</span>
        </div>
      </div>
      
      <div className="event-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          height="auto"
          aspectRatio={1.35}
          initialDate={new Date()}
          nowIndicator={true}
          dayMaxEvents={true}
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
          }}
        />
      </div>
      
      {renderEventModal()}
    </div>
  );
};

export default EventCalendar; 