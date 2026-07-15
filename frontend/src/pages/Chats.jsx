import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import useChatSocket from "../hooks/useChatSocket";
import { useAuth } from "../context/AuthContext";

export default function Chats() {
  const { user } = useAuth();
  const socketRef = useChatSocket();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chat/conversations").then(({ data }) => setConversations(data.conversations));
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (msg) => {
      if (active && msg.interest === active._id) setMessages((prev) => [...prev, msg]);
    };
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, socketRef.current]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (conv) => {
    setActive(conv);
    const { data } = await api.get(`/chat/${conv._id}/messages`);
    setMessages(data.messages);
    socketRef.current?.emit("join_conversation", { interestId: conv._id });
  };

  const send = () => {
    if (!text.trim() || !active) return;
    socketRef.current?.emit("send_message", { interestId: active._id, text }, (res) => {
      if (!res.ok) alert(res.error);
    });
    setText("");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-73px)] max-w-6xl">
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-slatex-100 p-4">
        <h2 className="font-display text-lg font-semibold text-ink">Chats</h2>
        <div className="mt-4 flex flex-col gap-2">
          {conversations.length === 0 && <p className="text-sm text-slatex-400">No accepted conversations yet.</p>}
          {conversations.map((c) => {
            const other = user.role === "owner" ? c.tenant : c.owner;
            return (
              <button
                key={c._id}
                onClick={() => openConversation(c)}
                className={`rounded-lg p-3 text-left text-sm transition ${active?._id === c._id ? "bg-moss-50" : "hover:bg-slatex-50"}`}
              >
                <p className="font-medium text-ink">{other?.name}</p>
                <p className="text-xs text-slatex-400">{c.listing?.title}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        {!active ? (
          <div className="flex flex-1 items-center justify-center text-slatex-400">Select a conversation to start chatting</div>
        ) : (
          <>
            <div className="border-b border-slatex-100 p-4">
              <p className="font-medium text-ink">{active.listing?.title}</p>
              <p className="text-xs text-slatex-400">{active.listing?.location}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.sender._id === user.id || m.sender._id === user._id;
                return (
                  <div key={m._id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${mine ? "bg-moss-600 text-white" : "bg-slatex-50 text-ink"}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-slatex-100 p-4">
              <input
                className="input"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn-primary" onClick={send}>
                Send
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
