export type LoginMode = "login" | "reset";

export const LOGIN_LOGO = new URL("../../assets/logomarca.png", import.meta.url).href;
export const LOGIN_SPINNER = "https://resources.upmobb.tech/images/ico_pwa_192.png";

const REMEMBER_KEY = "upmobb.chat.rememberEmail";

export function getRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setRememberedEmail(email: string | null): void {
  try {
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // ignore
  }
}
