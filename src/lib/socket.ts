import { io, type Socket } from "socket.io-client";
import { API_ROOT } from "@/lib/api-config";

let socket: Socket | null = null;
let connectedWith: string | null = null;

export const getSocket = (token: string): Socket | null => {
  if (!API_ROOT) {
    console.error("NEXT_PUBLIC_API_URL is not set — realtime is disabled.");
    return null;
  }

  if (socket && connectedWith === token) return socket;

  closeSocket();
  connectedWith = token;
  socket = io(API_ROOT, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const closeSocket = () => {
  if (!socket) return;

  socket.removeAllListeners();
  socket.close();
  socket = null;
  connectedWith = null;
};
