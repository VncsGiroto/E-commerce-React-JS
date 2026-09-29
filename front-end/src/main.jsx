import React from "react";
import { createRoot } from "react-dom/client";
import PageRoutes from "./routes/PageRoutes.jsx";

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <PageRoutes/>
)
