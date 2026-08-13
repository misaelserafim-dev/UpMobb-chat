export type ContactTag = {
  id: string;
  label: string;
  color?: string;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  avatar?: string;
  tags?: ContactTag[];
};

export type FetchContactsParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

export type FetchContactsResult = {
  items: Contact[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateContactPayload = {
  name: string;
  phone: string;
  dialCode: string;
  email?: string;
  notes?: string;
  tags?: ContactTag[];
};

export type UpdateContactPayload = {
  id: string;
  name: string;
  phone: string;
  dialCode?: string;
  email?: string;
  notes?: string;
  tags?: ContactTag[];
};

export type DeleteContactPayload = {
  id: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Mock grande (~420) para validar lista sem misturar no bundle da Home. */
function buildMockContacts(total = 420): Contact[] {
  const names = [
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
  const surnames = [
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

  return Array.from({ length: total }, (_, i) => {
    const name = `${names[i % names.length]} ${surnames[i % surnames.length]} ${i + 1}`;
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

const ALL_CONTACTS = buildMockContacts();

/**
 * Futuro: GET /contacts?page=&pageSize=&q=
 * Hoje: mock local paginado — a página Contatos só carrega quando a rota abre (lazy).
 */
export async function fetchContacts(
  params: FetchContactsParams = {},
): Promise<FetchContactsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  await wait(450);

  const filtered = q
    ? ALL_CONTACTS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.notes || "").toLowerCase().includes(q) ||
          (c.tags || []).some((t) => t.label.toLowerCase().includes(q)),
      )
    : ALL_CONTACTS;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((c) => ({
    ...c,
    tags: c.tags ? c.tags.map((t) => ({ ...t })) : undefined,
  }));

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}

/** Futuro: POST /contacts  Body: CreateContactPayload */
export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  await wait(280);
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const id = `c-${Date.now()}`;
  const created: Contact = {
    id,
    name,
    phone,
    email: payload.email?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
    avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(id)}`,
    tags: payload.tags?.length ? payload.tags.map((t) => ({ ...t })) : undefined,
  };
  ALL_CONTACTS.unshift(created);
  return {
    ...created,
    tags: created.tags ? created.tags.map((t) => ({ ...t })) : undefined,
  };
}

/** Futuro: PUT /contacts/:id  Body: UpdateContactPayload */
export async function updateContact(payload: UpdateContactPayload): Promise<Contact> {
  await wait(280);
  const current = ALL_CONTACTS.find((c) => c.id === payload.id);
  if (!current) {
    throw new Error("Contato não encontrado");
  }
  const next: Contact = {
    ...current,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
    tags: payload.tags?.length ? payload.tags.map((t) => ({ ...t })) : undefined,
  };
  const idx = ALL_CONTACTS.findIndex((c) => c.id === payload.id);
  ALL_CONTACTS[idx] = next;
  return {
    ...next,
    tags: next.tags ? next.tags.map((t) => ({ ...t })) : undefined,
  };
}

/** Futuro: DELETE /contacts/:id */
export async function deleteContact(payload: DeleteContactPayload): Promise<{ id: string }> {
  await wait(280);
  const idx = ALL_CONTACTS.findIndex((c) => c.id === payload.id);
  if (idx >= 0) ALL_CONTACTS.splice(idx, 1);
  return { id: payload.id };
}
