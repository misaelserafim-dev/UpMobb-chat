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
          (c.tags || []).some((t) => t.label.toLowerCase().includes(q)),
      )
    : ALL_CONTACTS;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    total: filtered.length,
    page,
    pageSize,
  };
}
