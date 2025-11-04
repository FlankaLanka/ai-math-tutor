# AI Math Tutor - Socratic Learning Assistant

A web-based AI math tutor that guides students through problems using **Socratic questioning**, not direct answers. Built with React, Tailwind CSS, and Vercel Serverless Functions.

## Features

- 🧠 **Socratic Method**: Guides students to discover solutions through questions
- 📝 **Text Input**: Students can type math problems
- 🖼️ **Image OCR**: Upload screenshots of math problems (coming in Phase 2)
- 💬 **Multi-turn Conversations**: Maintains context throughout problem-solving
- 🎨 **Sketch-style UI**: Playful, hand-drawn aesthetic

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS (hosted on Vercel)
- **Backend**: Express.js + Node.js (hosted on Railway/Render)
- **AI**: OpenAI GPT-4 for Socratic dialogue
- **Math Rendering**: KaTeX for LaTeX rendering

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   npm run install:backend
   ```

3. **Set up frontend environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Set up backend environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```

### Running Locally

**Terminal 1 - Backend**:
```bash
npm run dev:backend
```
Backend runs on `http://localhost:8000`

**Terminal 2 - Frontend**:
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
ai-math-tutor/
├── backend/            # Express.js backend
│   ├── lib/           # Shared utilities
│   │   ├── openai.js  # OpenAI client
│   │   └── orchestrator.js # Socratic dialogue logic
│   ├── routes/        # API routes
│   │   └── chat.js    # POST /api/chat
│   ├── server.js      # Express server
│   └── package.json   # Backend dependencies
├── src/                # React frontend
│   ├── components/    # React components
│   ├── config/        # Configuration
│   │   └── api.js     # API URL config
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
└── package.json        # Frontend dependencies
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)
5. Deploy!

### Backend (Railway/Render/etc)

**Railway (Recommended)**:
1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Deploy from GitHub repo
4. Set root directory to `backend`
5. Add environment variables:
   - `OPENAI_API_KEY`
   - `FRONTEND_URL` = Your Vercel frontend URL
6. Deploy!

**Render**:
1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repo
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Deploy!

## Development Phases

- ✅ **Phase 1**: Project setup & basic chat flow
- ⏳ **Phase 2**: Image upload & OCR
- ⏳ **Phase 3**: Socratic orchestrator & validation
- ⏳ **Phase 4**: UI polish & math rendering
- ⏳ **Phase 5**: Persistence & polish

## Architecture

- **Frontend**: React + Vite (hosted on Vercel)
- **Backend**: Express.js (hosted on Railway/Render)
- **API Communication**: Frontend calls backend via `VITE_API_URL` environment variable
- **CORS**: Configured in Express backend to allow Vercel frontend

## License

MIT
