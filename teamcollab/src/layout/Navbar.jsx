import { Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { profile } = useAuth();

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      
      {/* Left Side (Optional Title) */}
      <h1 className="text-slate-200 font-semibold text-lg">
        TeamCollab
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <Bell className="text-slate-400 w-5 h-5" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 hidden sm:inline">
            {profile?.name}
          </span>

          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile?.name || "U"
            )}&background=10b981&color=fff`}
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}