import { Icons } from "../icons.js";
import { escapeAttr } from "../utils/escape.js";

const LOGO_URL = "./assets/logomarca.png";
const SPINNER_URL = "https://resources.upmobb.tech/images/ico_pwa_192.png";

export function LoginPage({
  mode = "login",
  email = "",
  password = "",
  remember = false,
  error = "",
  resetSent = false,
  passwordVisible = false,
  loading = false,
} = {}) {
  if (mode === "reset") {
    return `
      <div class="login-screen" id="login-page">
        <form class="login-card" id="login-reset-form" autocomplete="on">
          <img
            class="login-card__logo"
            src="${escapeAttr(LOGO_URL)}"
            alt="UpMobb"
            width="180"
            height="48"
          />

          <p class="login-card__hint">Informe seu e-mail para redefinir a senha.</p>

          <label class="login-field">
            <span class="login-field__icon" aria-hidden="true">${Icons.contact}</span>
            <input
              type="email"
              id="login-reset-email"
              name="email"
              placeholder="E-mail"
              value="${escapeAttr(email)}"
              required
              autocomplete="username"
            />
          </label>

          ${
            resetSent
              ? `<p class="login-card__success">Se o e-mail existir, você receberá as instruções em breve.</p>`
              : ""
          }
          ${error ? `<p class="login-card__error">${escapeAttr(error)}</p>` : ""}

          <button type="submit" class="login-card__submit">Enviar</button>

          <button type="button" class="login-card__link" data-login-back>
            Voltar ao login
          </button>
        </form>
      </div>
    `;
  }

  const pwdType = passwordVisible ? "text" : "password";

  return `
    <div class="login-screen" id="login-page">
      <form class="login-card" id="login-form" autocomplete="on">
        <img
          class="login-card__logo"
          src="${escapeAttr(LOGO_URL)}"
          alt="UpMobb"
          width="180"
          height="48"
        />

        <label class="login-field">
          <span class="login-field__icon" aria-hidden="true">${Icons.contact}</span>
          <input
            type="email"
            id="login-email"
            name="email"
            placeholder="E-mail"
            value="${escapeAttr(email)}"
            autocomplete="username"
            ${loading ? "disabled" : ""}
          />
        </label>

        <label class="login-field">
          <span class="login-field__icon" aria-hidden="true">${Icons.lock}</span>
          <input
            type="${pwdType}"
            id="login-password"
            name="password"
            placeholder="Senha"
            value="${escapeAttr(password)}"
            autocomplete="current-password"
            ${loading ? "disabled" : ""}
          />
          <button
            type="button"
            class="login-field__toggle"
            id="login-password-toggle"
            aria-label="${passwordVisible ? "Ocultar senha" : "Mostrar senha"}"
            title="${passwordVisible ? "Ocultar senha" : "Mostrar senha"}"
            ${loading ? "disabled" : ""}
          >${passwordVisible ? Icons.eyeOff : Icons.eye}</button>
        </label>

        <div class="login-card__row">
          <label class="login-remember">
            <input type="checkbox" id="login-remember" name="remember" ${
              remember ? "checked" : ""
            } ${loading ? "disabled" : ""} />
            <span class="login-remember__box" aria-hidden="true"></span>
            <span class="login-remember__label">Lembrar</span>
          </label>
          <button type="button" class="login-card__forgot" data-login-forgot ${
            loading ? "disabled" : ""
          }>
            Esqueceu a senha?
          </button>
        </div>

        ${error ? `<p class="login-card__error">${escapeAttr(error)}</p>` : ""}

        <div class="login-card__actions">
          ${
            loading
              ? `<span class="login-card__spinner-wrap is-visible">
                  <img
                    class="login-card__spinner"
                    src="${escapeAttr(SPINNER_URL)}"
                    alt=""
                    width="40"
                    height="40"
                    aria-hidden="true"
                  />
                </span>`
              : `<button type="submit" class="login-card__submit">Entrar</button>`
          }
        </div>
      </form>
    </div>
  `;
}
