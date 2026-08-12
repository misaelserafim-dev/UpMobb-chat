export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // TODO: trocar pelo fetch real, ex:
  // return api.post<LoginResponse>("/auth/login", payload)
  await wait(800);

  if (!payload.email.trim() || !payload.password) {
    throw new Error("Informe e-mail e senha.");
  }

  return {
    token: "mock-token",
    user: {
      id: "1",
      name: payload.email.trim(),
      email: payload.email.trim(),
    },
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  // TODO: trocar pelo fetch real, ex:
  // return api.post("/auth/forgot-password", { email })
  await wait(300);

  if (!email.trim()) {
    throw new Error("Informe o e-mail.");
  }
}
