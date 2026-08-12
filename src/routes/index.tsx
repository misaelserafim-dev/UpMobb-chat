import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Login = lazy(() =>
  import("../pages/Login/Login.tsx").then((m) => ({ default: m.Login })),
);
const Home = lazy(() =>
  import("../pages/Home/Home.tsx").then((m) => ({ default: m.Home })),
);
const Contatos = lazy(() =>
  import("../pages/Contatos/Contatos.tsx").then((m) => ({ default: m.Contatos })),
);
const Componentes = lazy(() =>
  import("../pages/Componentes/Componentes.tsx").then((m) => ({ default: m.Componentes })),
);

function RouteFallback() {
  return <div className="route-fallback" aria-busy="true" aria-label="Carregando" />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
