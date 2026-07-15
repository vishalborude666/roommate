import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useChatSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("roomatch_token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
