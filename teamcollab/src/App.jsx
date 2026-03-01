import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth, RequireTeam } from "./components/RequireAuth";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import SetupTeam from "./pages/SetupTeam";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Kanban from "./pages/Kanban";
import Team from "./pages/Team";
import Chat from "./pages/Chat";
import Assistant from "./pages/Assistant";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/setup-team"
            element={
              <RequireAuth>
                <SetupTeam />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <RequireTeam>
                  <MainLayout />
                </RequireTeam>
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="team" element={<Team />} />
            <Route path="chat" element={<Chat />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
