import { apiRequest } from "@/services/api.ts";

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

/** GET /contacts?page=&pageSize=&q= */
export async function fetchContacts(
  params: FetchContactsParams = {},
): Promise<FetchContactsResult> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize || 40));
  const q = (params.query || "").trim();

  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (q) search.set("q", q);

  return apiRequest<FetchContactsResult>(`/contacts?${search}`);
}

/** POST /contacts */
export async function createContact(payload: CreateContactPayload): Promise<Contact> {
  return apiRequest<Contact>("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PUT /contacts/:id */
export async function updateContact(payload: UpdateContactPayload): Promise<Contact> {
  const { id, ...body } = payload;
  return apiRequest<Contact>(`/contacts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** DELETE /contacts/:id */
export async function deleteContact(
  payload: DeleteContactPayload,
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/contacts/${encodeURIComponent(payload.id)}`, {
    method: "DELETE",
  });
}
