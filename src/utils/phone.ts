export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function maskPhoneBR(value = "") {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskPhoneIntl(value = "", maxDigits = 15) {
  const d = onlyDigits(value).slice(0, maxDigits);
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function maskPhone(value = "", dialCode = "+55") {
  if (dialCode === "+55") return maskPhoneBR(value);
  return maskPhoneIntl(value);
}

export function phonePlaceholder(dialCode = "+55") {
  return dialCode === "+55" ? "(11) 99999-9999" : "Número";
}
