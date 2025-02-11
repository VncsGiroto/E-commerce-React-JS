import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Inicio from '../pages/Inicio';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Inicio/>}/>
    </Routes>
  );
};

export default ClientRoutes;
