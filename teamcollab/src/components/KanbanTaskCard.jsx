import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { tasksApi } from "../lib/api";

export default function KanbanTaskCard({ task, isOverlay }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const saveTitle = async () => {
    if (title.trim() === task.title) {
      setEditing(false);
      return;
    }
    try {
      await tasksApi.update(task._id, { title: title.trim() });
      task.title = title.trim();
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const card = (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      className={`p-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 shadow ${
        isDragging || isOverlay ? "opacity-95 ring-2 ring-emerald-500" : ""
      } cursor-grab active:cursor-grabbing`}
    >
      {editing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Enter" && saveTitle()}
          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-100 text-sm"
          autoFocus
        />
      ) : (
        <div
          className="text-sm"
          onDoubleClick={() => setEditing(true)}
        >
          {task.title}
        </div>
      )}
      {task.assignedTo && (
        <p className="text-xs text-slate-500 mt-1">
          → {task.assignedTo.name || task.assignedTo.email}
        </p>
      )}
    </div>
  );

  return card;
}
