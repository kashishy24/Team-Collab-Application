import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  Users,
  MessageSquare,
  Bot,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 text-slate-200 flex flex-col">
      <h1 className="text-xl font-bold p-5 border-b border-slate-700">TeamCollab</h1>
      <nav className="flex-1 p-3 space-y-1">
        <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/projects" icon={<FolderKanban size={18} />} label="Projects" />
        <NavItem to="/kanban" icon={<Columns3 size={18} />} label="Kanban Board" />
        <NavItem to="/team" icon={<Users size={18} />} label="Team Members" />
        <NavItem to="/chat" icon={<MessageSquare size={18} />} label="Chat" />
        <NavItem to="/assistant" icon={<Bot size={18} />} label="Assistant" />
      </nav>
      <div className="p-3 border-t border-slate-700">
        <p className="text-xs text-slate-500 mb-1 truncate">{profile?.email}</p>
        <p className="text-xs text-slate-400 mb-2">Role: {profile?.role}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          isActive ? "bg-emerald-600/20 text-emerald-400" : "hover:bg-slate-800 text-slate-300"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
