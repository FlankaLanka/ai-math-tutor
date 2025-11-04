import OpenAI from 'openai';

let openaiClient = null;

/**
 * Get or create OpenAI client instance
 * API key should be set in environment variable OPENAI_API_KEY
 */
export function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

