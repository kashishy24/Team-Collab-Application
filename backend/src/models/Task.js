import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedTo: 1 });

export const Task = mongoose.model('Task', taskSchema);
