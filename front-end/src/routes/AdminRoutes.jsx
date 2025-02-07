import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashbord';
import ProtectedRoute from '../hooks/ProtectedRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/" element={<AdminLogin/>}/>
      <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
