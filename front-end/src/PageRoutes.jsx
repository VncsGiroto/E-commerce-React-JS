import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Admin from "./pages/Admin";

export default function PageRoutes(){
    return <BrowserRouter>
        <Routes>
            <Route index path="/" element={<Inicio/>}/>
            <Route index path="/admin" element={<Admin/>}/>
        </Routes>
    </BrowserRouter>
}