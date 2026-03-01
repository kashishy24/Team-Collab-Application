import { useEffect, useState } from "react";
import { projectsApi, tasksApi } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";

export default function Dashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .list()
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!projects.length) return;
    const loads = projects.map((p) =>
      tasksApi.list(p._id).then((r) => ({ id: p._id, tasks: r.data }))
    );
    Promise.all(loads).then((results) => {
      const map = {};
      let total = 0;
      let done = 0;
      results.forEach(({ id, tasks }) => {
        map[id] = tasks;
        total += tasks.length;
        done += tasks.filter((t) => t.status === "done").length;
      });
      setTasksByProject(map);
    });
  }, [projects]);

  const totalTasks = Object.values(tasksByProject).flat().length;
  const completedTasks = Object.values(tasksByProject)
    .flat()
    .filter((t) => t.status === "done").length;
  const pendingTasks = totalTasks - completedTasks;

  if (loading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-slate-100">
        Welcome, {profile?.name} 👋
      </h2>
      <p className="text-slate-400 mb-6">
        Team: {profile?.teamId?.name || "—"} | Role: {profile?.role}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Projects" value={String(projects.length)} color="blue" />
        <StatCard title="Total Tasks" value={String(totalTasks)} color="teal" />
        <StatCard title="Completed" value={String(completedTasks)} color="green" />
        <StatCard title="Pending" value={String(pendingTasks)} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.slice(0, 4).map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            taskCount={(tasksByProject[project._id] || []).length}
            doneCount={
              (tasksByProject[project._id] || []).filter((t) => t.status === "done").length
            }
          />
        ))}
      </div>
    </div>
  );
}
