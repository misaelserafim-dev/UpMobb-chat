import { Route, Routes } from "react-router-dom";
import { Componentes } from "../pages/Componentes/Componentes.tsx";
import { Home } from "../pages/Home/Home.tsx";
import { Login } from "../pages/Login/Login.tsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/componentes" element={<Componentes />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
