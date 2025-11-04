import express from 'express';
import { getOpenAIClient } from '../lib/openai.js';

const router = express.Router();

/**
 * POST /api/tts
 * Text-to-speech endpoint using OpenAI TTS API
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = req.body;

    // Validate required fields
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Clean text (remove LaTeX, markdown, etc.)
    const cleanText = text
      .replace(/\$\$.*?\$\$/g, '') // Remove block math
      .replace(/\$.*?\$/g, '') // Remove inline math
      .replace(/\[.*?\]/g, '') // Remove LaTeX brackets
      .replace(/\(.*?\)/g, '') // Remove LaTeX parentheses
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'Text is empty after cleaning' });
    }

    // Validate voice parameter
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

    // Validate speed (0.25 to 4.0)
    const validSpeed = Math.max(0.25, Math.min(4.0, parseFloat(speed) || 1.0));

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: selectedVoice,
      input: cleanText,
      speed: validSpeed
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Send audio data
    res.send(buffer);
  } catch (error) {
    console.error('TTS API error:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(500).json({ 
        error: error.response.data?.error?.message || 'OpenAI API error' 
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

export default router;

