import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyReservations from './pages/MyReservations';
import HotelManagement from './pages/HotelManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AdminUserList from './pages/AdminUserList';
import AdminUserEdit from './pages/AdminUserEdit';
import CheckInManager from './pages/CheckInManager';
import SettlementReport from './pages/SettlementReport';
import FlightManagement from './pages/FlightManagement';
import AxiosInterceptor from './components/AxiosInterceptor';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <AxiosInterceptor />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/my-reservations" element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } />

          <Route path="/manage-hotels" element={
            <ProtectedRoute roles={['OWNER', 'ADMIN']}>
              <HotelManagement />
            </ProtectedRoute>
          } />

          <Route path="/check-in" element={
            <ProtectedRoute roles={['OWNER', 'ADMIN']}>
              <CheckInManager />
            </ProtectedRoute>
          } />

          <Route path="/settlement" element={
            <ProtectedRoute roles={['OWNER', 'ADMIN']}>
              <SettlementReport />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUserList />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUserEdit />
            </ProtectedRoute>
          } />
          <Route path="/admin/flights" element={
            <ProtectedRoute roles={['ADMIN']}>
              <FlightManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
