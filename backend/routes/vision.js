import express from 'express';
import { getOpenAIClient } from '../lib/openai.js';

const router = express.Router();

/**
 * POST /api/vision
 * Image OCR endpoint using OpenAI GPT-4 Vision
 */
router.post('/vision', async (req, res) => {
  try {
    const { image } = req.body;

    // Validate required fields
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Validate image format (should be base64 data URL)
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Expected base64 data URL.' });
    }

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // Call OpenAI GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the math problem from this image. Return only the problem text, nothing else. If there are multiple problems, extract the first one. Include any equations, numbers, and text exactly as shown.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const extractedText = response.choices[0]?.message?.content?.trim();

    if (!extractedText) {
      return res.status(500).json({ error: 'Failed to extract text from image' });
    }

    return res.status(200).json({
      extractedText: extractedText
    });
  } catch (error) {
    console.error('Vision API error:', error);
    
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

