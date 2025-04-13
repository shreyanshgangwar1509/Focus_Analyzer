import express from 'express';
import Session from './Session.model.js'; // adjust path if needed

const router = express.Router();

router.get('/api/session/:email', async (req, res) => {
  try {
    const session = await Session.findOne({ email: req.params.email }).sort({ startedAt: -1 });
    if (!session) return res.status(404).json({ message: "No session found" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
