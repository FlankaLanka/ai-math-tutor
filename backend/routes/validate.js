import express from 'express';
import { validateAnswer } from '../lib/validation.js';

const router = express.Router();

/**
 * POST /api/validate
 * Validate a student's answer using OpenAI GPT-4 (LLM-as-judge)
 */
router.post('/validate', async (req, res) => {
  try {
    const { studentAnswer, problem, expectedAnswer } = req.body;

    // Validate required fields
    if (!studentAnswer) {
      return res.status(400).json({ error: 'Student answer is required' });
    }

    if (!problem) {
      return res.status(400).json({ error: 'Problem is required' });
    }

    // Validate the answer
    const validation = await validateAnswer(studentAnswer, problem, expectedAnswer);

    return res.status(200).json({
      isCorrect: validation.isCorrect,
      feedback: validation.feedback,
      confidence: validation.confidence
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

export default router;

