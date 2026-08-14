import type {
  Contact,
  CreateContactPayload,
  FetchContactsResult,
  UpdateContactPayload,
} from "@/services/contacts.ts";

/**
 * Mocks de contatos — só enquanto VITE_API_URL não estiver definido.
 * Delete `src/data` ao plugar o backend.
 */

const NAMES = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Elena",
  "Fábio",
  "Gabi",
  "Hugo",
  "Iris",
  "João",
  "Karen",
  "Leo",
  "Marina",
  "Nina",
  "Otto",
  "Paula",
  "Rafa",
  "Sofia",
  "Tiago",
  "Vera",
];

const SURNAMES = [
  "Silva",
  "Souza",
  "Lima",
  "Costa",
  "Alves",
  "Rocha",
  "Dias",
  "Nunes",
  "Pires",
  "Melo",
];

function buildMockContacts(total = 420): Contact[] {
  return Array.from({ length: total }, (_, i) => {
    const name = `${NAMES[i % NAMES.length]} ${SURNAMES[i % SURNAMES.length]} ${i + 1}`;
    const ddd = 11 + (i % 80);
    const phone = `+55 ${ddd} 9${String(1000 + (i % 9000)).slice(0, 4)}-${String(1000 + ((i * 7) % 9000)).slice(0, 4)}`;
    return {
      id: `c-${i + 1}`,
      name,
      phone,
      email: `contato${i + 1}@empresa.com`,
      avatar: `https://i.pravatar.cc/80?u=contact-${i + 1}`,
      tags:
        i % 5 === 0
          ? [{ id: "consultor", label: "Consultor / Vendedor UpMobb", color: "#9ca3af" }]
          : i % 3 === 0
            ? [{ id: "vip", label: "VIP", color: "#ef4444" }]
            : i % 2 === 0
              ? [{ id: "suporte", label: "Suporte", color: "#8b5cf6" }]
              : undefined,
    };
  });
}

function cloneContact(c: Contact): Contact {
  return {
    ...c,
    tags: c.tags ? c.tags.map((t) => ({ ...t })) : undefined,
  };
}

let contacts = buildMockContacts();

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
