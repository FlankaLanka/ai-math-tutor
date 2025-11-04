# Backend API Server

Express.js backend for AI Math Tutor.

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Run the server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /api/chat
Socratic dialogue endpoint.

**Request:**
```json
{
  "message": "Student's message",
  "conversationHistory": [],
  "problem": "Math problem text"
}
```

**Response:**
```json
{
  "reply": "Tutor's response",
  "conversationHistory": [...]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Math Tutor API is running"
}
```

## Deployment

Deploy to:
- **Railway**: Recommended - easy setup, $5/month credit
- **Render**: Free tier available
- **Fly.io**: Good performance
- **Any Node.js hosting**: Works with any platform

Set environment variables in your hosting platform:
- `OPENAI_API_KEY`
- `PORT` (usually auto-set)
- `FRONTEND_URL` (your Vercel frontend URL for CORS)

