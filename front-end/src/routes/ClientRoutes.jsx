import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Inicio from '../pages/Inicio';
import Cart from '../pages/Cart'; // Import the Cart page
import Login from '../pages/Login'; // Import the Login page
import Register from '../pages/Register'; // Import the Register page
import Items from '../components/Items'; // Import Items component

const PrivateRoute = ({ element: Component }) => {
  const userToken = localStorage.getItem("userToken");
  return userToken ? <Component /> : <Navigate to="/register" />;
};

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Inicio/>}/>
      <Route path="/cart" element={<PrivateRoute element={Cart} />}/> {/* Add the Cart route */}
      <Route path="/login" element={<Login/>}/> {/* Add the Login route */}
      <Route path="/register" element={<Register/>}/> {/* Add the Register route */}
      <Route path="/items/:category" element={<Items/>}/> {/* Add the Items route */}
    </Routes>
  );
};

export default ClientRoutes;
