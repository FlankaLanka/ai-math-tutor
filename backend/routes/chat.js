import express from 'express';
import { createOrchestrator } from '../lib/orchestrator.js';

const router = express.Router();

/**
 * POST /api/chat
 * Socratic dialogue endpoint
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, image, conversationHistory = [], problem } = req.body;

    // Validate required fields - allow message OR image
    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    if (!problem) {
      return res.status(400).json({ error: 'Problem is required' });
    }

    // Validate image format if provided
    if (image && !image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Expected base64 data URL.' });
    }

    // Create orchestrator and generate response
    const orchestrator = createOrchestrator(problem, conversationHistory);
    const response = await orchestrator.generateResponse(message || '', image);

    return res.status(200).json({
      reply: response.reply,
      conversationHistory: response.updatedHistory,
      stuckInfo: response.stuckInfo || { isStuck: false, stuckCount: 0, reason: 'Student is progressing normally' }
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

export default router;

