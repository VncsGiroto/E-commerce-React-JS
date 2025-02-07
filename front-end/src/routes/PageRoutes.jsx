import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientRoutes from "./ClientRoutes";
import AdminRoutes from "./AdminRoutes";

export default function PageRoutes(){
    return <BrowserRouter>
        <ClientRoutes/>
        <AdminRoutes/>
    </BrowserRouter>
}