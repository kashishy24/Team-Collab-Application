import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../lib/socket";

export default function MainLayout() {
  const { profile } = useAuth();
  const teamId = profile?.teamId?._id || profile?.teamId;
  useSocket(teamId, profile?._id, profile?.name);

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <div className="p-6 overflow-y-auto text-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
