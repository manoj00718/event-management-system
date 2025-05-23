import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FAQ.css';

const faqData = [
  {
    question: "How do I create an event?",
    answer: "To create an event, you need to sign up as an organizer. Once logged in, click on the 'Create Event' button in your dashboard and fill in the required details like event title, date, location, and description."
  },
  {
    question: "How do I register for an event?",
    answer: "Browse the events on our platform and click on any event you're interested in. On the event details page, click 'Register for Event' and follow the payment process if it's a paid event."
  },
  {
    question: "Can I get a refund if I can't attend an event?",
    answer: "Refund policies vary by event. Check the specific event's details page for the organizer's refund policy. In general, most events allow cancellations up to 48 hours before the event start time."
  },
  {
    question: "How do I become an event organizer?",
    answer: "When you register for an account, select 'Organizer' as your role. You'll then have access to event creation tools. If you already have an account, you can upgrade to an organizer account from your profile settings."
  },
  {
    question: "Are there fees for using EventHub?",
    answer: "EventHub charges a small service fee for paid events (typically 5% of the ticket price). Creating an account and organizing free events doesn't incur any fees."
  },
  {
    question: "How can I contact an event organizer?",
    answer: "On the event details page, you'll find the organizer's information. Registered users can directly message organizers through our platform's messaging system."
  },
  {
    question: "Does EventHub offer virtual event support?",
    answer: "Yes! EventHub fully supports virtual events. You can add streaming links, integrate with popular video conferencing platforms, and manage virtual attendees just like in-person ones."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2>Frequently Asked Questions</h2>
        <p className="faq-subtitle">Find answers to common questions about using EventHub</p>
        
        <div className="faq-accordion">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => toggleAccordion(index)}
              >
                <h3>{faq.question}</h3>
                <FontAwesomeIcon
                  icon={activeIndex === index ? 'chevron-up' : 'chevron-down'}
                  className="faq-icon"
                />
              </div>
              <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="faq-contact">
          <p>Can't find the answer you're looking for?</p>
          <a href="mailto:support@eventhub.com" className="faq-contact-link">
            <FontAwesomeIcon icon="envelope" /> Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 