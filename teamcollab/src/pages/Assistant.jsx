import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { assistantApi, projectsApi } from "../lib/api";

export default function Assistant() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [command, setCommand] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    projectsApi.list().then((r) => setProjects(r.data)).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (projects.length && !projectId) setProjectId(projects[0]._id);
  }, [projects, projectId]);

  const send = async () => {
    const text = command.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { type: "user", text }]);
    setCommand("");
    setLoading(true);
    try {
      const { data } = await assistantApi.command(text, projectId || undefined);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: data.message,
          success: data.success,
          tasks: data.tasks,
          task: data.task,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "assistant", text: err.response?.data?.error || err.message || "Something went wrong.", success: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">AI Assistant</h2>
      <p className="text-slate-400 text-sm mb-4">
        Manage tasks in natural language. Examples: &quot;Create task Fix login bug&quot;, &quot;List tasks&quot;, &quot;Assign task X to user@email.com&quot;, &quot;Mark task X as done&quot;.
      </p>
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-1">Project (for commands)</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2"
        >
          <option value="">Default (first project)</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[360px]">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm">Send a command to get started.</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={msg.type === "user" ? "flex justify-end" : ""}>
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 ${
                  msg.type === "user"
                    ? "bg-emerald-600/30 text-slate-100"
                    : msg.success
                    ? "bg-slate-800 text-slate-200"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.task && (
                  <p className="text-xs text-slate-400 mt-1">
                    Task: {msg.task.title} {msg.task.status && `(${msg.task.status})`}
                  </p>
                )}
                {msg.tasks?.length > 0 && (
                  <ul className="text-xs text-slate-400 mt-1 list-disc list-inside">
                    {msg.tasks.slice(0, 5).map((t) => (
                      <li key={t._id}>{t.title}</li>
                    ))}
                    {msg.tasks.length > 5 && <li>...and {msg.tasks.length - 5} more</li>}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="e.g. Create task Implement dark mode"
            className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
