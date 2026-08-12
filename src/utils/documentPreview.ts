export type DocumentKind = "pdf" | "text" | "word" | "other";

export type DocumentPreviewFile = {
  url: string;
  name: string;
  size?: string;
  pages?: string;
  /** Tipo legado da mensagem (`pdf` | `file`) ou MIME */
  type?: string;
};

const TEXT_EXT = new Set(["txt", "md", "csv", "log", "json", "xml", "html", "htm", "css", "js", "ts"]);
const WORD_EXT = new Set(["doc", "docx", "odt", "rtf"]);
const PDF_EXT = new Set(["pdf"]);

function extensionOf(name = "") {
  const base = name.split("?")[0]?.split("#")[0] || "";
  const parts = base.split(".");
  return parts.length > 1 ? (parts.pop() || "").toLowerCase() : "";
}

/** Detecta o tipo de documento para preview/badge. */
export function getDocumentKind(file: {
  name?: string;
  type?: string;
  mime?: string;
}): DocumentKind {
  const mime = (file.mime || file.type || "").toLowerCase();
  const ext = extensionOf(file.name);

  if (mime.includes("pdf") || file.type === "pdf" || PDF_EXT.has(ext)) return "pdf";
  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    TEXT_EXT.has(ext)
  ) {
    return "text";
  }
  if (
    mime.includes("msword") ||
    mime.includes("wordprocessingml") ||
    mime.includes("opendocument.text") ||
    mime.includes("rtf") ||
    WORD_EXT.has(ext)
  ) {
    return "word";
  }
  return "other";
}

export function getDocumentBadge(kind: DocumentKind, name = "") {
  if (kind === "pdf") return "PDF";
  if (kind === "word") {
    const ext = extensionOf(name).toUpperCase();
    return (ext || "DOC").slice(0, 4);
  }
  if (kind === "text") {
    const ext = extensionOf(name).toUpperCase();
    return (ext || "TXT").slice(0, 4);
  }
  const ext = extensionOf(name).toUpperCase();
  return (ext || "FILE").slice(0, 4);
}

/** PDF e texto dão pra pré-visualizar inline no browser. */
export function canInlinePreview(kind: DocumentKind) {
  return kind === "pdf" || kind === "text";
}

export function getDocumentPreviewLabel(kind: DocumentKind) {
  if (kind === "pdf") return "Pré-visualização do PDF";
  if (kind === "text") return "Pré-visualização do texto";
  if (kind === "word") return "Documento Word";
  return "Arquivo";
}
