import { io, type Socket } from "socket.io-client";
import { API_BASE, getAuthToken } from "@/services/api.ts";

let socket: Socket | null = null;

/** Conecta uma única vez usando o token JWT da sessão. Null sem API ou sem login. */
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
