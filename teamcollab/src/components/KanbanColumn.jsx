import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanTaskCard from "./KanbanTaskCard";
import { useState } from "react";
import { tasksApi } from "../lib/api";

export default function KanbanColumn({ id, title, tasks, canManage, onRefresh, projectId }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await tasksApi.create({ projectId, title: newTitle.trim(), status: id });
      setNewTitle("");
      setAdding(false);
      onRefresh?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 p-4 min-h-[200px] transition ${
        isOver ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
      }`}
    >
      <h3 className="font-semibold text-slate-200 mb-3 flex justify-between items-center">
        {title}
        <span className="text-slate-500 text-sm font-normal">{tasks.length}</span>
      </h3>
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <KanbanTaskCard key={task._id} task={task} />
          ))}
        </div>
      </SortableContext>
      {canManage && (
        <div className="mt-3">
          {adding ? (
            <form onSubmit={handleAdd} className="flex flex-col gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                className="rounded bg-slate-800 border border-slate-600 px-2 py-1.5 text-sm text-slate-100"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs px-2 py-1 rounded bg-emerald-600 text-white"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewTitle(""); }}
                  className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="text-sm text-slate-500 hover:text-emerald-400"
            >
              + Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
