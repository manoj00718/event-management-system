import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatusBanner from './components/ConnectionStatusBanner';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import DeleteEvent from './pages/DeleteEvent';
import Profile from './components/Profile/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './components/Notifications/Notifications';
import Dashboard from './pages/Dashboard';
import EventRating from './components/EventRating/EventRating';
import Comments from './components/Comments/Comments';
import Calendar from './pages/Calendar';
import MyTickets from './pages/MyTickets';
import Payment from './pages/Payment';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import {
  faCalendarAlt, faCalendarCheck, faCalendarDay, faClipboardCheck, 
  faTicketAlt, faChartLine, faThLarge, 
  faSignOutAlt, faImages, faCommentDots, faBell, faCog, faMobileAlt,
  faSearch, faChevronDown, faMapMarkerAlt, faEllipsisH, faCalendar,
  faChevronLeft, faChevronRight, faEnvelope, faStar, faPaperPlane,
  faFileAlt, faTrashAlt, faEye, faPencilAlt, faDownload, 
  faCaretDown, faPlus, faCheck,
  faTimes, faEyeSlash, faUser, faClock, faUsers, faArrowRight,
  faMapPin, faPhoneAlt, faEnvelopeOpenText, faMoneyBillAlt, faTags,
  faUserTie, faUserShield, faLock, faSpinner, faExclamationTriangle,
  faCreditCard, faCalendarPlus, faHeart, faHeartBroken, faFilter,
  faSort, faSortUp, faSortDown, faShareAlt, faLink, faQrcode, faSync,
  faExclamationCircle, faRedo, faQuestionCircle, faServer,
  faCheckCircle, faUserPlus, faChartBar, faSignInAlt, faLaptop,
  faChalkboardTeacher, faHandshake, faMoon, faSun, faBars, faPrint,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar, faComment as farComment, faClock as farClock, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

// Add icons to library
library.add(
  fab, faCalendarAlt, faCalendarCheck, faCalendarDay, faClipboardCheck, 
  faTicketAlt, faChartLine, faThLarge, 
  faSignOutAlt, faImages, faCommentDots, faBell, faCog, faMobileAlt,
  faSearch, faChevronDown, faMapMarkerAlt, faEllipsisH, faCalendar,
  faChevronLeft, faChevronRight, faEnvelope, faStar, farStar, faPaperPlane,
  faFileAlt, faTrashAlt, faEye, faPencilAlt, faDownload, 
  faCaretDown, faPlus, faCheck,
  faTimes, faEyeSlash, farComment, faUser, faClock, faUsers, faArrowRight,
  faMapPin, faPhoneAlt, faEnvelopeOpenText, faMoneyBillAlt, faTags, farClock,
  faUserTie, faUserShield, faLock, faSpinner, faExclamationTriangle,
  faCreditCard, faCalendarPlus, faHeart, farHeart, faHeartBroken, faFilter,
  faSort, faSortUp, faSortDown, faShareAlt, faLink, faQrcode, faSync,
  faExclamationCircle, faRedo, faQuestionCircle, faServer,
  faCheckCircle, faUserPlus, faChartBar, faSignInAlt, faLaptop,
  faChalkboardTeacher, faHandshake, faMoon, faSun, faBars, faPrint,
  faHistory
);

const App = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [isServerConnected, setIsServerConnected] = useState(true);

  // Check server connection on app load
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000) // Timeout after 5 seconds
        });
        
        setIsServerConnected(response.ok);
      } catch (error) {
        console.error('Server connection check failed:', error);
        setIsServerConnected(false);
      }
    };
    
    checkServerConnection();
  }, []);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ThemeProvider>
        <UserProvider>
          <div className="app">
            <ConnectionStatusBanner />
            {isAuthenticated && !loading && <Navbar />}
            <MobileNavbar />
            <div className={isAuthenticated && !loading ? "main-content with-sidebar" : "main-content no-sidebar"}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={
                  <ErrorBoundary>
                    <EventDetails />
                  </ErrorBoundary>
                } />
                <Route path="/payment/:id" element={
                  <ErrorBoundary>
                    {isAuthenticated ? <Payment /> : <Navigate to="/login" />}
                  </ErrorBoundary>
                } />
                {isAuthenticated && (user?.role === 'organizer' || user?.role === 'admin') && (
                  <>
                    <Route path="/events/create" element={<CreateEvent />} />
                    <Route path="/events/:id/edit" element={
                      <ErrorBoundary>
                        <EditEvent />
                      </ErrorBoundary>
                    } />
                    <Route path="/events/:id/delete" element={
                      <ErrorBoundary>
                        <DeleteEvent />
                      </ErrorBoundary>
                    } />
                  </>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <>
                    <Route path="/admin/users" element={<Navigate to="/dashboard" />} />
                    <Route path="/admin/reports" element={<Navigate to="/dashboard" />} />
                    <Route path="/admin/settings" element={<Navigate to="/dashboard" />} />
                  </>
                )}
                <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
                <Route path="/my-tickets" element={isAuthenticated ? <MyTickets /> : <Navigate to="/login" />} />
                <Route path="/events/:eventId/ratings" element={<EventRating />} />
                <Route path="/events/:eventId/comments" element={<Comments />} />
                <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 