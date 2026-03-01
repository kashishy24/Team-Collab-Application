import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function Projects() {
  const navigate = useNavigate();
  const { canManageProjects, canDeleteProjects } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const load = () => projectsApi.list().then((r) => setProjects(r.data)).catch(() => setProjects([]));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setError("");
    setModal("create");
  };

  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || "" });
    setError("");
    setModal({ type: "edit", id: p._id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (modal === "create") {
        await projectsApi.create(form);
      } else {
        await projectsApi.update(modal.id, form);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project? Tasks will be removed.")) return;
    try {
      await projectsApi.remove(id);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed");
    }
  };

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Projects</h2>
        {canManageProjects && (
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium"
          >
            New project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p._id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-col"
          >
            <h3 className="font-semibold text-slate-100">{p.name}</h3>
            {p.description && (
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{p.description}</p>
            )}
            <div className="mt-4 flex gap-2">
              <a
                href="/kanban"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/kanban?projectId=" + p._id);
                }}
                className="text-sm text-emerald-400 hover:underline"
              >
                Open Kanban
              </a>
              {canManageProjects && (
                <button
                  onClick={() => openEdit(p)}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Edit
                </button>
              )}
              {canDeleteProjects && (
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              {modal === "create" ? "New project" : "Edit project"}
            </h3>
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-slate-100 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  {modal === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
