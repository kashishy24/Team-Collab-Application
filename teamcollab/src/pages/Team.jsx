import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authApi, projectsApi } from "../lib/api";

export default function Team() {
  const { profile, isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getMembers()
      .then((r) => setMembers(r.data))
      .catch(() => setMembers([]));
    projectsApi
      .list()
      .then((r) => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await authApi.updateMemberRole(userId, role);
      setMembers((prev) =>
        prev.map((m) => (m._id === userId ? { ...m, role } : m))
      );
    } catch (err) {
      console.error(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Team Members</h2>
      <p className="text-slate-400 text-sm mb-6">
        {profile?.teamId?.name} · {projects.length} project(s)
      </p>
      <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              {isAdmin && <th className="p-4 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m._id} className="border-b border-slate-700/50">
                <td className="p-4 text-slate-200">{m.name}</td>
                <td className="p-4 text-slate-400">{m.email}</td>
                <td className="p-4">
                  <span
                    className={`font-medium ${
                      m.role === "ADMIN"
                        ? "text-amber-400"
                        : m.role === "MANAGER"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {m.role}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-4">
                    {m._id !== profile?._id && (
                      <select
                        value={m.role}
                        onChange={(e) => updateRole(m._id, e.target.value)}
                        className="rounded bg-slate-800 border border-slate-600 text-slate-200 text-sm px-2 py-1"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
