import * as XLSX from "xlsx";
import type { Contact, ContactTag } from "@/services/contacts.ts";
import { DIAL_CODES } from "@/utils/dialCodes.ts";
import type { Etiqueta } from "@/services/etiquetas.ts";

export type ImportContactDraft = {
  key: string;
  name: string;
  phone: string;
  dialCode: string;
  iso: string;
  email?: string;
  notes?: string;
  tagLabels: string[];
  tags: ContactTag[];
  status: "new" | "duplicate";
  existingId?: string;
  existingName?: string;
};

type ExcelRow = Record<string, unknown>;

function cell(row: ExcelRow, ...keys: string[]) {
  for (const key of keys) {
    const found = Object.keys(row).find((k) => k.trim().toLowerCase() === key.toLowerCase());
    if (!found) continue;
    const value = row[found];
    if (value == null) continue;
    return String(value).trim();
  }
  return "";
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function parsePhone(raw: string): { phone: string; dialCode: string; iso: string } {
  const digits = digitsOnly(raw);
  if (!digits) return { phone: "", dialCode: "+55", iso: "BR" };

  // Excel costuma vir sem "+" (ex.: 5511999999999)
  const sorted = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const code of sorted) {
    const dialDigits = digitsOnly(code.dial);
    if (digits.startsWith(dialDigits) && digits.length > dialDigits.length) {
      const national = digits.slice(dialDigits.length);
      return {
        phone: `${code.dial} ${national}`.trim(),
        dialCode: code.dial,
        iso: code.iso,
      };
    }
  }

  // fallback BR local
  if (digits.length >= 10 && digits.length <= 11) {
    return { phone: `+55 ${digits}`, dialCode: "+55", iso: "BR" };
  }

  return { phone: `+${digits}`, dialCode: "+55", iso: "BR" };
}

function parseTagLabels(raw: string) {
  if (!raw) return [];
  return raw
    .split(/[,;/|]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function mapTags(labels: string[], etiquetas: Etiqueta[]): ContactTag[] {
  return labels.map((label) => {
    const match = etiquetas.find((e) => e.name.toLowerCase() === label.toLowerCase());
    return match
      ? { id: match.id, label: match.name, color: match.color }
      : { id: `import-${label.toLowerCase().replace(/\s+/g, "-")}`, label, color: "#9ca3af" };
  });
}

/** Lê .xlsx/.xls/.csv e devolve rascunhos prontos para preview. */
export async function parseContactsWorkbook(
  file: File,
  existing: Contact[],
  etiquetas: Etiqueta[] = [],
): Promise<ImportContactDraft[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });
  const byPhone = new Map(
    existing.map((c) => [digitsOnly(c.phone), c] as const).filter(([phone]) => Boolean(phone)),
  );

  const drafts: ImportContactDraft[] = [];
  const seenInFile = new Set<string>();

  rows.forEach((row, index) => {
    const name = cell(row, "Nome", "Name", "nome") || "Sem nome";
    const numberRaw = cell(row, "Número", "Numero", "Telefone", "Phone", "phone");
    const email = cell(row, "Email", "E-mail", "e-mail") || undefined;
    const notes = cell(row, "Observações", "Observacoes", "Notes", "Obs") || undefined;
    const tagLabels = parseTagLabels(cell(row, "Etiquetas", "Tags", "Label"));

    if (!numberRaw && !email && name === "Sem nome") return;

    const parsed = parsePhone(numberRaw);
    if (!parsed.phone && !email) return;

    const phoneKey = digitsOnly(parsed.phone) || `email:${(email || "").toLowerCase()}` || `row-${index}`;
    if (seenInFile.has(phoneKey)) return;
    seenInFile.add(phoneKey);

    const existingContact = byPhone.get(digitsOnly(parsed.phone));

    drafts.push({
      key: `${phoneKey}-${index}`,
      name,
      phone: parsed.phone || email || "",
      dialCode: parsed.dialCode,
      iso: parsed.iso,
      email: email || undefined,
      notes: notes || undefined,
      tagLabels,
      tags: mapTags(tagLabels, etiquetas),
      status: existingContact ? "duplicate" : "new",
      existingId: existingContact?.id,
      existingName: existingContact?.name,
    });
  });

  return drafts;
}

export async function fetchAllContactsForImport(
  fetchPage: (params: { page: number; pageSize: number }) => Promise<{ items: Contact[]; total: number }>,
): Promise<Contact[]> {
  const pageSize = 100;
  const first = await fetchPage({ page: 1, pageSize });
  const all = [...first.items];
  const totalPages = Math.max(1, Math.ceil((first.total || all.length) / pageSize));

  for (let page = 2; page <= totalPages; page += 1) {
    const res = await fetchPage({ page, pageSize });
    all.push(...res.items);
  }

  return all;
}
