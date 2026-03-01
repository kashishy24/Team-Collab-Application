import { Link } from "react-router-dom";

export default function ProjectCard({ project, taskCount = 0, doneCount = 0 }) {
  return (
    <Link
      to="/kanban"
      state={{ projectId: project._id }}
      className="block p-5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 transition"
    >
      <h3 className="font-semibold text-slate-100">{project.name}</h3>
      {project.description && (
        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{project.description}</p>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
        <span>{taskCount} tasks</span>
        <span>{doneCount} done</span>
      </div>
    </Link>
  );
}
