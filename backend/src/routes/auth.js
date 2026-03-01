import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { teamCreate, registerBody, loginBody } from '../validators/index.js';
import { Team, User } from '../models/index.js';

const router = Router();

// Public routes (no auth)
router.post('/register', validate(registerBody), async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const token = signToken(user._id);
    const profile = await User.findById(user._id).populate('teamId').lean();
    delete profile.password;
    return res.status(201).json({ token, user: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', validate(loginBody), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    const profile = await User.findById(user._id).populate('teamId').lean();
    return res.json({ token, user: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Protected routes
router.use(authMiddleware);

router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('teamId').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { name } = req.body;
    if (name !== undefined) req.user.name = name;
    await req.user.save();
    const user = await User.findById(req.user._id).populate('teamId').lean();
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

router.post('/teams', validate(teamCreate), async (req, res) => {
  try {
    if (req.user.teamId) {
      return res.status(400).json({ error: 'You are already in a team' });
    }
    const team = await Team.create({
      name: req.body.name,
      description: req.body.description || '',
      adminId: req.user._id,
    });
    req.user.teamId = team._id;
    req.user.role = 'ADMIN';
    await req.user.save();
    const user = await User.findById(req.user._id).populate('teamId').lean();
    return res.status(201).json({ team, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create team' });
  }
});

router.get('/teams/members', async (req, res) => {
  try {
    if (!req.user.teamId) return res.status(400).json({ error: 'Not in a team' });
    const members = await User.find({ teamId: req.user.teamId })
      .select('name email role')
      .lean();
    return res.json(members);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.patch('/teams/members/:userId/role', requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'MANAGER', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const member = await User.findOne({
      _id: userId,
      teamId: req.user.teamId,
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    member.role = role;
    await member.save();
    return res.json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;
