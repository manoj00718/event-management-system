import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Profile from './components/Profile/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './components/Notifications/Notifications';
import Dashboard from './components/Analytics/Dashboard';
import EventRating from './components/EventRating/EventRating';
import Comments from './components/Comments/Comments';
import { useAuth } from './context/AuthContext';
import './styles/App.css';

const App = () => {
  const { user } = useAuth();

  return (
    <UserProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            {user && (user.role === 'organizer' || user.role === 'admin') && (
              <>
                <Route path="/events/create" element={<CreateEvent />} />
                <Route path="/events/:id/edit" element={<EditEvent />} />
              </>
            )}
            <Route path="/profile" element={user ? <Profile /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events/:eventId/ratings" element={<EventRating />} />
            <Route path="/events/:eventId/comments" element={<Comments />} />
          </Routes>
        </main>
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
  );
};

export default App; 