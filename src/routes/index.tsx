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
        <Route path="/etiquetas" element={<Etiquetas />} />
        <Route path="/departamentos" element={<Departamentos />} />
        <Route path="/respostas-rapidas" element={<RespostasRapidas />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
