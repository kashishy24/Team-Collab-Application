import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { messagesApi } from "../lib/api";
import { getSocket } from "../lib/socket";

export default function Chat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const socket = getSocket();

  const teamId = profile?.teamId?._id || profile?.teamId;

  useEffect(() => {
    if (!teamId) return;
    messagesApi
      .list(teamId)
      .then((r) => setMessages(r.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [teamId]);

  useEffect(() => {
    if (!socket || !teamId) return;
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("chat:message", onMessage);
    return () => socket.off("chat:message", onMessage);
  }, [socket, teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const content = input.trim();
    if (!content || !teamId || !profile) return;
    if (socket?.connected) {
      socket.emit("chat:message", {
        content,
        senderId: profile._id,
        senderName: profile.name,
        teamId,
      });
      setInput("");
      return;
    }
    messagesApi
      .send({ content, teamId })
      .then((r) => setMessages((prev) => [...prev, r.data]))
      .catch(console.error);
    setInput("");
  };

  if (!teamId) return <div className="text-slate-400">No team.</div>;
  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Team Chat</h2>
      <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m._id || m.timestamp}
              className={`flex ${m.senderId?._id === profile?._id || m.senderId === profile?._id ? "justify-end" : ""}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  m.senderId?._id === profile?._id || m.senderId === profile?._id
                    ? "bg-emerald-600/30 text-slate-100"
                    : "bg-slate-800 text-slate-200"
                }`}
              >
                <p className="text-xs text-slate-400 mb-0.5">
                  {m.senderId?.name || m.senderId?.email || "Someone"}
                </p>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={send}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
