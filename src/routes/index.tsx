import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

const Login = lazy(() =>
  import("../pages/Login/Login.tsx").then((m) => ({ default: m.Login })),
);

const Home = lazy(() =>
  import("../pages/Home/Home.tsx").then((m) => ({ default: m.Home })),
);

const Contatos = lazy(() =>
  import("../pages/Contatos/Contatos.tsx").then((m) => ({ default: m.Contatos })),
);

const Etiquetas = lazy(() =>
  import("../pages/Etiquetas/Etiquetas.tsx").then((m) => ({ default: m.Etiquetas })),
);

const Departamentos = lazy(() =>
  import("../pages/Departamentos/Departamentos.tsx").then((m) => ({ default: m.Departamentos })),
);

const RespostasRapidas = lazy(() =>
  import("../pages/RespostasRapidas/RespostasRapidas.tsx").then((m) => ({
    default: m.RespostasRapidas,
  })),
);

const Equipe = lazy(() =>
  import("../pages/Equipe/Equipe.tsx").then((m) => ({ default: m.Equipe })),
);

const Conexoes = lazy(() =>
  import("../pages/Conexoes/Conexoes.tsx").then((m) => ({ default: m.Conexoes })),
);

const Componentes = lazy(() =>
  import("../pages/Componentes/Componentes.tsx").then((m) => ({ default: m.Componentes })),
);

function RouteFallback() {
  return <div className="route-fallback" aria-busy="true" aria-label="Carregando" />;
}

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/contatos" element={<Contatos />} />
          <Route element={<RequireAdmin />}>
            <Route path="/etiquetas" element={<Etiquetas />} />
            <Route path="/departamentos" element={<Departamentos />} />
            <Route path="/respostas-rapidas" element={<RespostasRapidas />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/conexoes" element={<Conexoes />} />
          </Route>
          <Route path="/componentes" element={<Componentes />} />
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
