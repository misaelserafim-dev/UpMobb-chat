import type { LoginPayload, LoginResponse } from "./Auth.ts";

export async function login(_payload: LoginPayload): Promise<LoginResponse> {
  // Chamadas de autenticação ficam aqui (via API/backend)
  throw new Error("login ainda não implementado");
}
