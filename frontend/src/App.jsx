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
import DiscountManagement from './pages/DiscountManagement';
import FlightManagement from './pages/FlightManagement';
import BoardList from './pages/BoardList';
import BoardWrite from './pages/BoardWrite';
import BoardDetail from './pages/BoardDetail';
import AxiosInterceptor from './components/AxiosInterceptor';
import AdminAccessLogs from './pages/AdminAccessLogs';

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

          <Route path="/manage-discounts" element={
            <ProtectedRoute roles={['OWNER', 'ADMIN']}>
              <DiscountManagement />
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
          <Route path="/admin/logs" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminAccessLogs />
            </ProtectedRoute>
          } />

          {/* Free Board Routes */}
          <Route path="/boards" element={<BoardList />} />
          <Route path="/boards/write" element={
            <ProtectedRoute>
              <BoardWrite />
            </ProtectedRoute>
          } />
          <Route path="/boards/edit/:id" element={
            <ProtectedRoute>
              <BoardWrite />
            </ProtectedRoute>
          } />
          <Route path="/boards/:id" element={<BoardDetail />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
