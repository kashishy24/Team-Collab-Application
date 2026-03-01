import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { assistantCommand } from '../validators/index.js';
import { Task, Project, User } from '../models/index.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MANAGER', 'MEMBER'));

function parseCommand(text) {
  const lower = text.toLowerCase().trim();
  const createMatch = text.match(/create\s+task\s+(?:called\s+|named\s+)?["']?([^"']+)["']?(?:\s+in\s+project\s+)?/i)
    || text.match(/add\s+task\s+["']?([^"']+)["']?/i)
    || text.match(/create\s+["']?([^"']+)["']?\s+task/i);
  if (createMatch) {
    return { action: 'create', title: createMatch[1].trim() };
  }
  if (/\b(list|show|get)\s+(?:all\s+)?tasks\b/i.test(lower)) {
    return { action: 'list' };
  }
  const assignMatch = text.match(/assign\s+task\s+["']?([^"']+)["']?\s+to\s+([^\s,]+@[\S]+)/i)
    || text.match(/assign\s+["']?([^"']+)["']?\s+to\s+([^\s,]+@[\S]+)/i);
  if (assignMatch) {
    return { action: 'assign', title: assignMatch[1].trim(), email: assignMatch[2].trim() };
  }
  const statusMatch = text.match(/(?:mark|set)\s+task\s+["']?([^"']+)["']?\s+as\s+(todo|in-progress|in progress|done)/i)
    || text.match(/(?:move|update)\s+["']?([^"']+)["']?\s+to\s+(todo|in-progress|in progress|done)/i);
  if (statusMatch) {
    let s = statusMatch[2].toLowerCase().replace(/\s+/, '-');
    if (s === 'inprogress') s = 'in-progress';
    return { action: 'status', title: statusMatch[1].trim(), status: s };
  }
  return null;
}

router.post('/', validate(assistantCommand), async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.status(400).json({ success: false, message: 'Join or create a team first.' });
    }
    const { command, projectId } = req.body;
    const parsed = parseCommand(command);
    if (!parsed) {
      return res.json({
        success: false,
        message: "I didn't understand. Try: 'Create task [title]', 'List tasks', 'Assign task [title] to [email]', or 'Mark task [title] as todo|in-progress|done'.",
      });
    }

    const projectFilter = projectId
      ? { _id: projectId, teamId: req.user.teamId }
      : { teamId: req.user.teamId };
    const projects = await Project.find(projectFilter).lean();
    const activeProject = projectId
      ? projects[0]
      : projects[0];

    if (!activeProject) {
      return res.json({ success: false, message: 'No project found. Create a project first or specify projectId.' });
    }

    if (parsed.action === 'list') {
      const tasks = await Task.find({ projectId: activeProject._id })
        .populate('assignedTo', 'name email')
        .sort({ order: 1 })
        .lean();
      return res.json({
        success: true,
        message: `Found ${tasks.length} task(s).`,
        tasks,
      });
    }

    if (parsed.action === 'create') {
      const maxOrder = await Task.findOne({ projectId: activeProject._id }).sort({ order: -1 }).select('order').lean();
      const task = await Task.create({
        title: parsed.title,
        projectId: activeProject._id,
        status: 'todo',
        order: (maxOrder?.order ?? 0) + 1,
      });
      const populated = await Task.findById(task._id).populate('assignedTo', 'name email').lean();
      return res.json({
        success: true,
        message: `Task "${parsed.title}" created.`,
        task: populated,
      });
    }

    if (parsed.action === 'assign') {
      const user = await User.findOne({ email: parsed.email, teamId: req.user.teamId });
      if (!user) {
        return res.json({ success: false, message: `User with email ${parsed.email} not found in your team.` });
      }
      const task = await Task.findOne({
        projectId: activeProject._id,
        title: new RegExp(parsed.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      });
      if (!task) {
        return res.json({ success: false, message: `Task "${parsed.title}" not found.` });
      }
      task.assignedTo = user._id;
      await task.save();
      const populated = await Task.findById(task._id).populate('assignedTo', 'name email').lean();
      return res.json({
        success: true,
        message: `Task assigned to ${user.name}.`,
        task: populated,
      });
    }

    if (parsed.action === 'status') {
      const status = parsed.status === 'inprogress' ? 'in-progress' : parsed.status;
      const task = await Task.findOne({
        projectId: activeProject._id,
        title: new RegExp(parsed.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      });
      if (!task) {
        return res.json({ success: false, message: `Task "${parsed.title}" not found.` });
      }
      task.status = status;
      await task.save();
      const populated = await Task.findById(task._id).populate('assignedTo', 'name email').lean();
      return res.json({
        success: true,
        message: `Task marked as ${status}.`,
        task: populated,
      });
    }

    return res.json({ success: false, message: "Could not process command." });
  } catch (err) {
    console.error('Assistant error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

export default router;
