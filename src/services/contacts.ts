import { API_BASE, apiListRequest, apiRequest } from "@/services/api.ts";

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

// Formato do backend (/panel/contacts)
type ContactDto = {
  id: string;
  connectionId: string;
  waId: string;
  phone: string;
  name: string | null;
};

function toContact(dto: ContactDto): Contact {
  return {
    id: dto.id,
    name: dto.name || dto.phone,
    phone: dto.phone,
  };
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/** GET — mocks `/contacts`; API `/panel/contacts`. */
export async function fetchContacts(
  params: FetchContactsParams = {},
): Promise<FetchContactsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim().toLowerCase();

  if (!API_BASE) {
    return apiRequest<FetchContactsResult>(
      `/contacts${qs({ page, pageSize, q: params.query })}`,
    );
  }

  const res = await apiListRequest<ContactDto>(
    `/panel/contacts?page=${page}&limit=${pageSize}`,
  );
  const items = res.data.map(toContact);
  const filtered = q
    ? items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
      )
    : items;

  return {
    items: filtered,
    total: res.page?.total ?? filtered.length,
    page,
    pageSize,
  };
}

/** Etiquetas do contato — só com API por enquanto. */
export async function fetchContactTags(contactId: string): Promise<ContactTag[]> {
  if (!API_BASE) return [];
  const rows = await apiRequest<Array<{ id: string; name: string; color: string }>>(
    `/panel/contacts/${encodeURIComponent(contactId)}/tags`,
  );
  return rows.map((t) => ({ id: t.id, label: t.name, color: t.color }));
}

export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  if (!API_BASE) {
    return apiRequest<Contact>("/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  throw new Error("Contatos são sincronizados do WhatsApp — cadastro manual indisponível.");
}

export async function updateContact(payload: UpdateContactPayload): Promise<Contact> {
  if (!API_BASE) {
    const { id, ...body } = payload;
    return apiRequest<Contact>(`/contacts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
  throw new Error("Contatos são sincronizados do WhatsApp — edição manual indisponível.");
}

export async function deleteContact(
  payload: DeleteContactPayload,
): Promise<{ id: string }> {
  if (!API_BASE) {
    return apiRequest<{ id: string }>(`/contacts/${encodeURIComponent(payload.id)}`, {
      method: "DELETE",
    });
  }
  throw new Error("Contatos são sincronizados do WhatsApp — exclusão manual indisponível.");
}
