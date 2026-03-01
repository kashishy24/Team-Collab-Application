import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { projectCreate, projectUpdate, idParam } from '../validators/index.js';
import { Project, User } from '../models/index.js';
import mongoose from 'mongoose';

const router = Router();

router.use(authMiddleware);

function requireTeam(req, res, next) {
  if (!req.user.teamId) {
    return res.status(400).json({ error: 'Join or create a team first' });
  }
  next();
}

router.get('/', requireTeam, async (req, res) => {
  try {
    const projects = await Project.find({ teamId: req.user.teamId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post(
  '/',
  requireTeam,
  requireRole('ADMIN', 'MANAGER'),
  validate(projectCreate),
  async (req, res) => {
    try {
      const project = await Project.create({
        ...req.body,
        teamId: req.user.teamId,
      });
      return res.status(201).json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

router.put(
  '/:id',
  requireTeam,
  requireRole('ADMIN', 'MANAGER'),
  validate(idParam, 'params'),
  validate(projectUpdate),
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        teamId: req.user.teamId,
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      Object.assign(project, req.body);
      await project.save();
      return res.json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }
);

router.delete(
  '/:id',
  requireTeam,
  requireRole('ADMIN'),
  validate(idParam, 'params'),
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        teamId: req.user.teamId,
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      await Project.deleteOne({ _id: project._id });
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }
);

export default router;
