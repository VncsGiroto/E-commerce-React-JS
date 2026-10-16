import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "../pages/Inicio";
import Register from "../pages/Register";
import Login from "../pages/Login";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashbord";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import OrderConfirmation from "../pages/OrderConfirmation";
import ProtectedRoute from "../hooks/ProtectedRoute";
import UserProtectedRoute from "../hooks/UserProtectedRoute";

export default function PageRoutes(){
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<Inicio/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route element={<UserProtectedRoute />}>
                <Route path="/cart" element={<Cart/>}/>
                <Route path="/orders" element={<Orders/>}/>
                <Route path="/orders/:id/confirmation" element={<OrderConfirmation/>}/>
            </Route>
            <Route path="/admin/" element={<AdminLogin/>}/>
            <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
    </BrowserRouter>
}
