import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  { timestamps: true }
);

projectSchema.index({ teamId: 1 });

export const Project = mongoose.model('Project', projectSchema);
