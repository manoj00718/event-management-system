import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventCalendar.css';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        
        // Transform events to FullCalendar format
        const formattedEvents = response.data.events.map(event => ({
          id: event._id,
          title: event.title,
          start: new Date(event.date),
          end: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), // Default 2 hours duration
          extendedProps: {
            description: event.description,
            location: event.location,
            category: event.category,
            status: event.status,
            isPaid: event.isPaid,
            price: event.price,
            capacity: event.capacity,
            attendees: event.attendees.length
          },
          backgroundColor: getEventColor(event.category),
          borderColor: getEventColor(event.category)
        }));
        
        setEvents(formattedEvents);
        setLoading(false);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        setLoading(false);
        console.error('Error fetching events:', err);
      }
    };
    
    fetchEvents();
  }, []);
  
  const getEventColor = (category) => {
    switch (category) {
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
    if (dateInfo.view.type === 'dayGridMonth') {
      // Switch to day view when clicking on a date
      dateInfo.view.calendar.changeView('timeGridDay', dateInfo.date);
    }
  };
  
  const renderEventContent = (eventInfo) => {
    const { extendedProps } = eventInfo.event;
    const isPaid = extendedProps.isPaid && extendedProps.price > 0;
    
    return (
      <div className="fc-event-content">
        <div className="fc-event-title">
          {eventInfo.event.title}
          {isPaid && <span className="paid-badge">$</span>}
        </div>
        <div className="fc-event-location">{extendedProps.location}</div>
        <div className="fc-event-attendees">
          {extendedProps.attendees}/{extendedProps.capacity} attendees
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
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
      />
    </div>
  );
};

export default EventCalendar; 