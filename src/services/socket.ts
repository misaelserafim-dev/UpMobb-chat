import { io, type Socket } from "socket.io-client";
import { API_BASE, getAuthToken } from "@/services/api.ts";

let socket: Socket | null = null;

/**
 * Conecta uma única vez usando o token JWT da sessão.
 * Sem VITE_API_URL (modo mock) ou sem login → null (código permanece; não remove).
 */
export function getSocket(): Socket | null {
  if (!API_BASE) return null;
  const token = getAuthToken();
  if (!token) return null;

  if (!socket) {
    socket = io(API_BASE, { auth: { token } });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
