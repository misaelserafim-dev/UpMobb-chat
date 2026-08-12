import { Route, Routes } from "react-router-dom";
import { Home } from "../pages/Home/Home.tsx";
import { Login } from "../pages/Login/Login.tsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
