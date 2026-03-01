import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { taskCreate, taskUpdate, idParam } from '../validators/index.js';
import { Task, Project } from '../models/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });
    if (!req.user.teamId) return res.status(400).json({ error: 'Join or create a team first' });
    const project = await Project.findOne({ _id: projectId, teamId: req.user.teamId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', validate(taskCreate), async (req, res) => {
  try {
    if (!req.user.teamId) return res.status(400).json({ error: 'Join or create a team first' });
    const project = await Project.findOne({ _id: req.body.projectId, teamId: req.user.teamId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const maxOrder = await Task.findOne({ projectId: req.body.projectId }).sort({ order: -1 }).select('order').lean();
    const task = await Task.create({
      ...req.body,
      order: (maxOrder?.order ?? 0) + 1,
    });
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').lean();
    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', validate(idParam, 'params'), validate(taskUpdate), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await Project.findById(task.projectId._id || task.projectId);
    if (!project || project.teamId.toString() !== req.user.teamId?.toString()) {
      return res.status(404).json({ error: 'Task not found' });
    }
    Object.assign(task, req.body);
    await task.save();
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').lean();
    return res.json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', validate(idParam, 'params'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await Project.findById(task.projectId);
    if (!project || project.teamId.toString() !== req.user.teamId?.toString()) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await Task.deleteOne({ _id: task._id });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
