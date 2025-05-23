# Event Management System

A modern event management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Core Features
- User authentication and authorization
- Event creation and management
- Event registration and ticketing
- User profiles and roles (Admin, Organizer, User)
- Event search and filtering
- Responsive design
- Custom styling without external UI libraries

### Advanced Features
- **QR Code Check-in System**: Generate and validate QR codes for event attendance
- **Waitlist Management**: Automatically manage waitlists when events are full
- **Event Reminders**: Email notifications before events
- **Calendar View**: Visual calendar interface for browsing events
- **Paid Events**: Process payments with Stripe integration
- **Event Analytics**: Track views, registrations, and attendance
- **Event Recommendations**: Personalized event suggestions based on user preferences
- **Dark Mode**: Toggle between light and dark themes
- **Geolocation**: Find events near you with map integration

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- FullCalendar for calendar view
- Chart.js for analytics visualization
- Custom CSS with CSS variables
- Responsive design
- Modern UI/UX

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- RESTful API
- Nodemailer for email notifications
- Stripe for payment processing
- QR code generation and validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/event-management-system.git
cd event-management-system
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email_from
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. Start the development servers:
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PATCH `/api/auth/profile` - Update user profile
- PATCH `/api/auth/change-password` - Change password

### Events
- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get single event
- POST `/api/events` - Create event (organizer only)
- PATCH `/api/events/:id` - Update event (organizer only)
- DELETE `/api/events/:id` - Delete event (organizer only)
- POST `/api/events/:id/register` - Register for event
- POST `/api/events/:id/cancel` - Cancel registration
- POST `/api/events/:id/check-in/:userId` - Check in attendee (organizer only)

### Waitlist
- POST `/api/waitlist/:eventId/join` - Join waitlist
- DELETE `/api/waitlist/:eventId/leave` - Leave waitlist
- POST `/api/waitlist/:eventId/notify` - Notify users on waitlist
- GET `/api/waitlist/:eventId` - Get waitlist (organizer only)

### Payments
- POST `/api/payments/create-payment-intent/:eventId` - Create payment intent
- POST `/api/payments/confirm/:paymentIntentId` - Confirm payment
- POST `/api/payments/refund/:eventId` - Process refund

### QR Codes
- POST `/api/qr-codes/generate/:eventId` - Generate QR code
- POST `/api/qr-codes/validate` - Validate QR code

### Recommendations
- GET `/api/recommendations` - Get recommended events
- GET `/api/recommendations/similar/:eventId` - Get similar events

### Users
- GET `/api/users/:id` - Get user profile
- GET `/api/users/:id/events` - Get user's organized events
- GET `/api/users/:id/registrations` - Get user's registered events
- PATCH `/api/users/:id/role` - Update user role (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
