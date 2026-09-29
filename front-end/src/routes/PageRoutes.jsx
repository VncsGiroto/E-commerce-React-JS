import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "../pages/Inicio";
import Register from "../pages/Register";
import Login from "../pages/Login";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashbord";
import ProtectedRoute from "../hooks/ProtectedRoute";

export default function PageRoutes(){
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<Inicio/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/admin/" element={<AdminLogin/>}/>
            <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
    </BrowserRouter>
}
