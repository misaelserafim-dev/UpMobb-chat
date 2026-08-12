import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Icons } from "@/componentes/Icons/Icons.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { login, requestPasswordReset } from "@/services/auth.ts";
import {
  getRememberedEmail,
  LOGIN_LOGO,
  LOGIN_SPINNER,
  setRememberedEmail,
  type LoginMode,
} from "./Login.ts";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const remembered = getRememberedEmail();
  const [mode, setMode] = useState<LoginMode>("login");
  const [email, setEmail] = useState(remembered);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(remembered));
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    document.title = "Upmobb | Login";
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    setError("");
    setLoading(true);

    try {
      const session = await login({ email: trimmedEmail, password });
      setRememberedEmail(remember ? trimmedEmail : null);
      setSession(session.user);
      navigate("/", { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Informe o e-mail.");
      setResetSent(false);
      return;
    }

    setError("");
    await requestPasswordReset(trimmedEmail);
    setResetSent(true);
  }

  function goToReset() {
    setMode("reset");
    setError("");
    setResetSent(false);
    setPassword("");
  }

  function goToLogin() {
    setMode("login");
    setError("");
    setResetSent(false);
  }

  if (mode === "reset") {
    return (
      <div className="login-screen">
        <form className="login-card" autoComplete="on" onSubmit={handleReset}>
          <img className="login-card__logo" src={LOGIN_LOGO} alt="UpMobb" width={180} height={48} />

          <p className="login-card__hint">Informe seu e-mail para redefinir a senha.</p>

          <label className="login-field">
            <span className="login-field__icon" aria-hidden="true">
              <Icons.Contact />
            </span>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={email}
              required
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {resetSent ? (
            <p className="login-card__success">
              Se o e-mail existir, você receberá as instruções em breve.
            </p>
          ) : null}
          {error ? <p className="login-card__error">{error}</p> : null}

          <button type="submit" className="login-card__submit">
            Enviar
          </button>

          <button type="button" className="login-card__link" onClick={goToLogin}>
            Voltar ao login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <form className="login-card" autoComplete="on" onSubmit={handleLogin}>
        <img className="login-card__logo" src={LOGIN_LOGO} alt="UpMobb" width={180} height={48} />

        <label className="login-field">
          <span className="login-field__icon" aria-hidden="true">
            <Icons.Contact />
          </span>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={email}
            autoComplete="username"
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="login-field">
          <span className="login-field__icon" aria-hidden="true">
            <Icons.Lock />
          </span>
          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={password}
            autoComplete="current-password"
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-field__toggle"
            aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            title={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            disabled={loading}
            onClick={() => setPasswordVisible((v) => !v)}
          >
            {passwordVisible ? <Icons.EyeOff /> : <Icons.Eye />}
          </button>
        </label>

        <div className="login-card__row">
          <label className="login-remember">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              disabled={loading}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="login-remember__box" aria-hidden="true" />
            <span className="login-remember__label">Lembrar</span>
          </label>
          <button type="button" className="login-card__forgot" disabled={loading} onClick={goToReset}>
            Esqueceu a senha?
          </button>
        </div>

        {error ? <p className="login-card__error">{error}</p> : null}

        <div className="login-card__actions">
          {loading ? (
            <span className="login-card__spinner-wrap is-visible">
              <img
                className="login-card__spinner"
                src={LOGIN_SPINNER}
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
              />
            </span>
          ) : (
            <button type="submit" className="login-card__submit">
              Entrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
