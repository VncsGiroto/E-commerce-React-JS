import React from "react";
import { createRoot } from "react-dom/client";
import PageRoutes from "./PageRoutes.jsx";

const contentor = document.getElementById('root');
const orign = createRoot(contentor);

orign.render(<PageRoutes/>)