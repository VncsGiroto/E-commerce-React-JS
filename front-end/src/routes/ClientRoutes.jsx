import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Inicio from '../pages/Inicio';
import Register from '../pages/Register';
import Login from '../pages/Login';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Inicio/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>}/>
    </Routes>
  );
};

export default ClientRoutes;
