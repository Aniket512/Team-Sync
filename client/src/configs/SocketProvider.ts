import { io } from "socket.io-client";
import { BASE_URL } from "../api/urls";

export const socket = io(BASE_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  // Keep trying so presence can re-register after brief network blips
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
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
