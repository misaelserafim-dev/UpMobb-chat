export function normalizeContact(c = {}) {
  const tags = Array.isArray(c.tags) ? c.tags : c.tag ? [c.tag] : [];
  return {
    id: c.id,
    name: c.name || "",
    phone: c.phone || "",
    email: c.email || "",
    notes: c.notes || "",
    company: c.company || "",
    avatar: c.avatar || "",
    color: c.color || "#0063a3",
    online: !!c.online,
    tags,
    tag: c.tag || tags[0] || null,
    etiqueta: tags.map((t) => t.label).filter(Boolean).join(" "),
  };
}

export function createContact({
  name,
  phone,
  email = "",
  notes = "",
  company = "",
  tags = [],
  avatar,
} = {}) {
  const id = `c-${Date.now()}`;
  return normalizeContact({
    id,
    name,
    phone,
    email,
    notes,
    company,
    avatar:
      avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e8e8ec&color=1a1a1a`,
    color: tags[0]?.color || "#0063a3",
    tags,
    tag: tags[0] || null,
  });
}
