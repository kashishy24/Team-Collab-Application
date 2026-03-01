import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { projectsApi, tasksApi } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import KanbanColumn from "../components/KanbanColumn";
import KanbanTaskCard from "../components/KanbanTaskCard";

const STATUSES = [
  { id: "todo", title: "To do" },
  { id: "in-progress", title: "In progress" },
  { id: "done", title: "Done" },
];

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get("projectId");
  const { profile, canManageProjects } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(projectIdFromUrl || "");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    projectsApi.list().then((r) => setProjects(r.data)).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (projectIdFromUrl) setProjectId(projectIdFromUrl);
  }, [projectIdFromUrl]);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    tasksApi
      .list(projectId)
      .then((r) => setTasks(r.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    let newStatus = null;
    if (["todo", "in-progress", "done"].includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) newStatus = overTask.status;
    }
    if (!newStatus) return;
    const taskId = String(active.id);
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;
    try {
      await tasksApi.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = () => {};

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);
  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Kanban Board</h2>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 min-w-[200px]"
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : !projectId ? (
        <p className="text-slate-400">Select a project to view tasks.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATUSES.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={tasksByStatus(col.id)}
                canManage={canManageProjects}
                onRefresh={() =>
                  tasksApi.list(projectId).then((r) => setTasks(r.data))
                }
                projectId={projectId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <KanbanTaskCard task={activeTask} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
