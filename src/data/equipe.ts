import type {
  CreateEquipePayload,
  EquipeMember,
  EquipePermissions,
  FetchEquipeResult,
  UpdateEquipePayload,
} from "@/services/equipe.ts";
import { emptyEquipePermissions } from "@/services/equipe.ts";

const SEED: EquipeMember[] = [
  {
    id: "eq-nicoly",
    name: "Nicoly",
    email: "nicoly@upmobb.tech",
    connectionId: "comercial-upmobb",
    profile: "admin",
    status: "online",
    departamentoIds: ["dept-comercial", "dept-suporte"],
    permissions: {
      ...emptyEquipePermissions(),
      historico: true,
      "ver-tickets": true,
      retornar: true,
    },
  },
  {
    id: "eq-carlos",
    name: "Carlos",
    email: "carlos@upmobb.tech",
    connectionId: "qrcode-suporte",
    profile: "user",
    status: "offline",
    departamentoIds: ["dept-suporte"],
    permissions: {
      ...emptyEquipePermissions(),
      historico: true,
      espiar: true,
    },
  },
  {
    id: "eq-ana",
    name: "Ana Paula",
    email: "ana@upmobb.tech",
    connectionId: "comercial-upmobb",
    profile: "user",
    status: "online",
    departamentoIds: ["dept-comercial"],
    permissions: {
      ...emptyEquipePermissions(),
      assinar: true,
      "ver-grupos": true,
    },
  },
];

let membros = SEED.map(cloneMember);

function cloneMember(m: EquipeMember): EquipeMember {
  return {
    ...m,
    departamentoIds: [...m.departamentoIds],
    permissions: { ...m.permissions },
  };
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(name: string) {
  const base = slugify(name) || "membro";
  let id = `eq-${base}`;
  let n = 1;
  while (membros.some((m) => m.id === id)) {
    n += 1;
    id = `eq-${base}-${n}`;
  }
  return id;
}

function mergePermissions(permissions: EquipePermissions): EquipePermissions {
  return { ...emptyEquipePermissions(), ...permissions };
}

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

function matchesQuery(m: EquipeMember, q: string) {
  if (!q) return true;
  return (
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    m.profile.toLowerCase().includes(q)
  );
}

export async function mockEquipeRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/equipe") {
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = membros.filter((item) => matchesQuery(item, q));
    const start = (page - 1) * pageSize;
    const result: FetchEquipeResult = {
      items: filtered.slice(start, start + pageSize).map(cloneMember),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/equipe") {
    const payload = body as CreateEquipePayload;
    const created: EquipeMember = {
      id: uniqueId(payload.name),
      name: payload.name.trim(),
      email: payload.email.trim(),
      connectionId: payload.connectionId,
      profile: payload.profile,
      status: "offline",
      departamentoIds: [...payload.departamentoIds],
      permissions: mergePermissions(payload.permissions),
    };
    membros = [...membros, created];
    return cloneMember(created);
  }

  const match = pathname.match(/^\/equipe\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateEquipePayload, "id">;
      const current = membros.find((item) => item.id === id);
      if (!current) throw new Error("Membro não encontrado");

      const next: EquipeMember = {
        ...current,
        name: payload.name.trim(),
        email: payload.email.trim(),
        connectionId: payload.connectionId,
        profile: payload.profile,
        departamentoIds: [...payload.departamentoIds],
        permissions: mergePermissions(payload.permissions),
      };
      membros = membros.map((item) => (item.id === id ? next : item));
      return cloneMember(next);
    }

    if (m === "DELETE") {
      membros = membros.filter((item) => item.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
