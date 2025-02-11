import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Items from "./components/Items";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/items" element={<Items />} />
                {/* ...existing routes... */}
            </Routes>
        </Router>
    );
}

export default App;
