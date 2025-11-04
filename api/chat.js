import { createOrchestrator } from '../lib/orchestrator.js';

/**
 * Vercel serverless function for Socratic dialogue
 * POST /api/chat
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [], problem } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!problem) {
      return res.status(400).json({ error: 'Problem is required' });
    }

    // Create orchestrator and generate response
    const orchestrator = createOrchestrator(problem, conversationHistory);
    const response = await orchestrator.generateResponse(message);

    return res.status(200).json({
      reply: response.reply,
      conversationHistory: response.updatedHistory
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

