import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { messageCreate } from '../validators/index.js';
import { Message, User } from '../models/index.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'teamId is required' });
    if (req.user.teamId?.toString() !== teamId) {
      return res.status(403).json({ error: 'Not in this team' });
    }
    const messages = await Message.find({ teamId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', validate(messageCreate), async (req, res) => {
  try {
    if (req.user.teamId?.toString() !== req.body.teamId) {
      return res.status(403).json({ error: 'Not in this team' });
    }
    const message = await Message.create({
      content: req.body.content,
      senderId: req.user._id,
      teamId: req.body.teamId,
    });
    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email')
      .lean();
    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
