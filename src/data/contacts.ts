import type {
  Contact,
  CreateContactPayload,
  FetchContactsResult,
  UpdateContactPayload,
} from "@/services/contacts.ts";

/**
 * Mocks de contatos — só enquanto VITE_API_URL não estiver definido.
 * Delete `src/data` ao plugar o backend.
 * Volume grande: usar importação Excel na página Contatos.
 */

const SEED: Contact[] = [
  {
    id: "c-1",
    name: "Ana Silva",
    phone: "+55 11 99876-5432",
    email: "ana.silva@email.com",
    notes: "Cliente recorrente",
    avatar: "https://i.pravatar.cc/80?u=contact-1",
    tags: [{ id: "vip", label: "VIP", color: "#ef4444" }],
  },
  {
    id: "c-2",
    name: "Bruno Costa",
    phone: "+55 21 98765-4321",
    email: "bruno.costa@empresa.com",
    avatar: "https://i.pravatar.cc/80?u=contact-2",
    tags: [{ id: "suporte", label: "Suporte", color: "#8b5cf6" }],
  },
  {
    id: "c-3",
    name: "Carla Mendes",
    phone: "+55 31 99654-3210",
    email: "carla.mendes@loja.com",
    notes: "Preferência por WhatsApp",
    avatar: "https://i.pravatar.cc/80?u=contact-3",
    tags: [{ id: "vendas", label: "Vendas", color: "#dc2626" }],
  },
  {
    id: "c-4",
    name: "Diego Rocha",
    phone: "+55 41 99123-4567",
    avatar: "https://i.pravatar.cc/80?u=contact-4",
  },
];

function cloneContact(c: Contact): Contact {
  return {
    ...c,
    tags: c.tags ? c.tags.map((t) => ({ ...t })) : undefined,
  };
}

let contacts = SEED.map(cloneContact);

function parseQuery(path: string) {
  const qIndex = path.indexOf("?");
  if (qIndex < 0) return { pathname: path, search: new URLSearchParams() };
  return {
    pathname: path.slice(0, qIndex),
    search: new URLSearchParams(path.slice(qIndex + 1)),
  };
}

function matchesQuery(c: Contact, q: string) {
  if (!q) return true;
  return (
    c.name.toLowerCase().includes(q) ||
    c.phone.toLowerCase().includes(q) ||
    (c.email || "").toLowerCase().includes(q) ||
    (c.notes || "").toLowerCase().includes(q) ||
    (c.tags || []).some((t) => t.label.toLowerCase().includes(q))
  );
}

/** Rotas alinhadas a `services/contacts.ts`. */
export async function mockContactsRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const { pathname, search } = parseQuery(path);
  const m = method.toUpperCase();

  if (m === "GET" && pathname === "/contacts") {
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.min(100, Math.max(10, Number(search.get("pageSize") || 40)));
    const q = (search.get("q") || "").trim().toLowerCase();

    const filtered = contacts.filter((c) => matchesQuery(c, q));
    const start = (page - 1) * pageSize;
    const result: FetchContactsResult = {
      items: filtered.slice(start, start + pageSize).map(cloneContact),
      total: filtered.length,
      page,
      pageSize,
    };
    return result;
  }

  if (m === "POST" && pathname === "/contacts") {
    const payload = body as CreateContactPayload;
    const id = `c-${Date.now()}`;
    const created: Contact = {
      id,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(id)}`,
      tags: payload.tags?.length ? payload.tags.map((t) => ({ ...t })) : undefined,
    };
    contacts = [created, ...contacts];
    return cloneContact(created);
  }

  const match = pathname.match(/^\/contacts\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);

    if (m === "PUT") {
      const payload = body as Omit<UpdateContactPayload, "id">;
      const idx = contacts.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error("Contato não encontrado");

      const next: Contact = {
        ...contacts[idx],
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        email: payload.email?.trim() || undefined,
        notes: payload.notes?.trim() || undefined,
        tags: payload.tags?.length ? payload.tags.map((t) => ({ ...t })) : undefined,
      };
      contacts[idx] = next;
      return cloneContact(next);
    }

    if (m === "DELETE") {
      contacts = contacts.filter((c) => c.id !== id);
      return { id };
    }
  }

  throw new Error(`Mock route not found: ${m} ${pathname}`);
}
