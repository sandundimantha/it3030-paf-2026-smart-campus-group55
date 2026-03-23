import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import FacilitiesList from './pages/FacilitiesList';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';
import NotificationsPage from './pages/NotificationsPage';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - requires JWT token in localStorage */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="facilities" element={<FacilitiesList />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
