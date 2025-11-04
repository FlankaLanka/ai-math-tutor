# Vercel Serverless Functions Setup Guide

## Overview

This project uses **Vercel Serverless Functions** for the backend API, keeping both frontend and backend on the same platform. This eliminates the need for CORS and simplifies deployment.

## Project Structure

```
ai-math-tutor/
├── src/                    # React frontend source
│   ├── components/
│   ├── App.jsx
│   └── ...
├── api/                    # Vercel serverless functions
│   ├── chat.js            # POST /api/chat
│   ├── vision.js          # POST /api/vision
│   └── validate.js        # POST /api/validate
├── lib/                    # Shared utilities
│   ├── orchestrator.js    # Socratic dialogue logic
│   ├── mathCheck.js       # Answer validation
│   └── openai.js          # OpenAI client setup
├── package.json
├── vercel.json            # Vercel configuration (optional)
└── .env.local             # Environment variables (never commit)
```

## Serverless Function Structure

### Basic Pattern

Each API route is a serverless function that exports a default handler:

```javascript
// api/chat.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Your logic here
    const { message, conversationHistory } = req.body;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a patient math tutor...' },
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    });

    return res.status(200).json({
      reply: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## API Routes

### 1. `/api/chat.js` - Socratic Dialogue

```javascript
import { createOrchestrator } from '../../lib/orchestrator.js';
import { getOpenAIClient } from '../../lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory, problem } = req.body;
    
    const orchestrator = createOrchestrator(problem, conversationHistory);
    const response = await orchestrator.generateResponse(message);
    
    return res.status(200).json({
      reply: response.reply,
      conversationHistory: response.updatedHistory
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 2. `/api/vision.js` - Image OCR

```javascript
import { getOpenAIClient } from '../../lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle image upload (base64 or FormData)
    const { image } = req.body;
    
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the math problem from this image. Return only the problem text, no explanation.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image // base64 or URL
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const extractedText = response.choices[0].message.content;
    
    return res.status(200).json({
      problem: extractedText
    });
  } catch (error) {
    console.error('Vision error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 3. `/api/validate.js` - Answer Validation

```javascript
import { getOpenAIClient } from '../../lib/openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentAnswer, expectedAnswer, problem } = req.body;
    
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a math validator. Determine if the student answer is correct. Respond with only "correct" or "incorrect".'
        },
        {
          role: 'user',
          content: `Problem: ${problem}\nExpected: ${expectedAnswer}\nStudent Answer: ${studentAnswer}\n\nIs the student answer correct?`
        }
      ],
      max_tokens: 10
    });

    const isCorrect = response.choices[0].message.content.toLowerCase().includes('correct');
    
    return res.status(200).json({
      isCorrect,
      feedback: isCorrect ? 'Great job!' : 'Try again!'
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

## Shared Utilities

### `lib/openai.js` - OpenAI Client

```javascript
import OpenAI from 'openai';

let openaiClient = null;

export function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}
```

### `lib/orchestrator.js` - Socratic Dialogue Logic

```javascript
import { getOpenAIClient } from './openai.js';

export function createOrchestrator(problem, conversationHistory = []) {
  const systemPrompt = `You are a patient math tutor. NEVER give direct answers. Guide through questions. If the student is stuck for more than 2 turns, provide a concrete hint. Use encouraging language.`;

  return {
    async generateResponse(userMessage) {
      const openai = getOpenAIClient();
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7
      });

      const reply = response.choices[0].message.content;
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: reply }
      ];

      return { reply, updatedHistory };
    }
  };
}
```

## Environment Variables

### Local Development

Create `.env.local` (never commit to git):

```env
OPENAI_API_KEY=sk-...
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `OPENAI_API_KEY` with your OpenAI API key
4. Deploy

## Frontend API Calls

Since frontend and backend are on the same origin, no CORS needed:

```javascript
// React component
const sendMessage = async (message) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationHistory,
      problem: originalProblem
    })
  });

  const data = await response.json();
  return data.reply;
};
```

## Image Upload Handling

For image uploads, convert to base64:

```javascript
// React component
const handleImageUpload = async (file) => {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64Image = reader.result;
    
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image
      })
    });

    const data = await response.json();
    setExtractedProblem(data.problem);
  };
  reader.readAsDataURL(file);
};
```

## Deployment

### Setup

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   Or connect GitHub repo in Vercel dashboard.

3. **Set Environment Variables**:
   - Go to Vercel project → Settings → Environment Variables
   - Add `OPENAI_API_KEY`

### Vercel Configuration (Optional)

Create `vercel.json` for custom configuration:

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## Benefits of This Approach

1. ✅ **Single Platform** - Everything on Vercel
2. ✅ **No CORS** - Same origin requests
3. ✅ **Auto-scaling** - Serverless functions scale automatically
4. ✅ **Simple Deployment** - One command, one repo
5. ✅ **Free Tier** - Generous limits for MVP
6. ✅ **Fast Cold Starts** - Vercel optimizes serverless functions

## Local Development

### Test Serverless Functions Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run dev server
vercel dev
```

This will:
- Run your React app
- Run serverless functions locally
- Simulate Vercel environment

## Troubleshooting

### Function Timeout

Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}
```

### Environment Variables Not Loading

- Check Vercel dashboard → Settings → Environment Variables
- Ensure variables are set for all environments (Production, Preview, Development)
- Redeploy after adding variables

### CORS Errors

Should not occur since frontend and backend are same origin. If you see CORS errors:
- Check that you're using relative URLs (`/api/chat` not `https://...`)
- Verify both frontend and API are deployed on same Vercel project

## Next Steps

1. Create `/api` directory structure
2. Implement serverless functions following patterns above
3. Create shared utilities in `/lib`
4. Test locally with `vercel dev`
5. Deploy to Vercel

