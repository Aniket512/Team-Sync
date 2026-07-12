import { io } from "socket.io-client";
import { BASE_URL } from "../api/urls";

export const socket = io(BASE_URL, {
  // Prefer polling first so proxies that block WS still connect; then upgrade
  transports: ["polling", "websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  path: "/socket.io",
});

// Tell the server we are leaving so online status clears promptly
if (typeof window !== "undefined") {
  const leavePresence = () => {
    if (socket.connected) {
      socket.emit("leave-user");
      socket.disconnect();
    }
  };

  window.addEventListener("beforeunload", leavePresence);
  window.addEventListener("pagehide", leavePresence);

  // Reconnect when returning via bfcache / tab restore
  window.addEventListener("pageshow", (event) => {
    if (event.persisted || !socket.connected) {
      socket.connect();
    }
  });
}
