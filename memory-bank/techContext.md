# Tech Context: Technologies & Setup

## Technology Stack

### Frontend
- **Framework**: ✅ **React** (Vite)
  - Fast development with hot module replacement
  - Modern React with hooks
  - Easy deployment to Vercel
- **Styling**: ✅ **Tailwind CSS** (required)
  - Utility-first CSS framework
  - Sketch/doodle style aesthetic implementation
  - Hand-drawn borders (2px/1.5px), organic shapes, playful design
  - Responsive design with Tailwind breakpoints
- **Fonts**: ✅ **Kalam & Caveat** (Google Fonts)
  - Sketch-style handwritten fonts applied globally
  - Creates playful, approachable aesthetic
  - Applied to all text elements
- **Math Rendering**: ✅ **KaTeX** (implemented)
  - Faster, lighter weight
  - LaTeX parsing from GPT-4 responses
  - Integrated with react-katex
- **UI Design**: Sketch/doodle style throughout
  - Refined borders (less intrusive than original)
  - Hand-drawn aesthetic with organic shapes
  - Playful, informal appearance
  - Sketch-style buttons, inputs, cards, and chat bubbles

### Backend
- **Framework**: ✅ **Express.js**
- **Language**: ✅ **Node.js** (JavaScript/TypeScript)
- **Structure**: Express server with route handlers
  - Server runs on port 8000 (local) or deployment platform (production)
  - Simple, fast setup for single-day build
  - Easier debugging than serverless functions
- **API Routes** in `backend/routes/`:
  - `/api/chat` - Socratic dialogue generation (✅ implemented)
  - `/api/vision` - Image OCR extraction (✅ implemented)
  - `/api/validate` - Answer validation (✅ implemented)
- **Shared Utilities** in `backend/lib/`:
  - `orchestrator.js` - Socratic dialogue logic with stuck detection and output filtering
  - `validation.js` - Answer validation and stuck detection utilities
  - `openai.js` - OpenAI client setup
- **Security**: API keys stored in backend `.env` file (local) or platform env vars (production)
- **CORS**: Configured to allow requests from frontend URL

### Database
- **Options**: Postgres or Firestore
  - Postgres: Self-hosted, SQL-based, relational
  - Firestore: Managed, NoSQL, serverless-friendly
- **Storage**: Sessions, conversation turns, solution state

### AI Services - OpenAI API Exclusively
- **Chat LLM**: ✅ **OpenAI GPT-4**
  - Strong reasoning and instruction-following
  - Supports system prompts and conversation context
  - Used for Socratic dialogue generation
- **Vision/OCR**: ✅ **OpenAI GPT-4 Vision**
  - Image → text extraction (OCR from screenshots)
  - Handles printed math problems from images

### Math Validation
- ✅ **OpenAI GPT-4 (LLM-as-judge approach)**
  - Validates numeric and algebraic answers
  - Evaluates correctness for both simple and complex problems
  - No separate math library needed for MVP

### Deployment
- **Frontend**: ✅ **Vercel** (static React build)
  - Build command: `npm run build`
  - Output directory: `dist`
  - Connect GitHub repo → Auto-deploys on push
  - Free tier with generous limits
  - Environment variable: `VITE_API_URL` (backend URL)
- **Backend**: ✅ **Railway** (recommended) or Render/Fly.io
  - Express.js server deployment
  - Root directory: `backend`
  - Start command: `npm start`
  - Environment variables: `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`
  - CORS configured for Vercel frontend URL
- **Database**: Optional for MVP (localStorage on client, no server-side storage needed)

## Development Setup

### Required Tools
- Node.js (if using JavaScript/TypeScript) OR Python 3.8+ (if using Python)
- Package manager: npm/yarn/pnpm (Node) or pip/poetry (Python)
- Git for version control
- Code editor (VS Code recommended)

### Environment Variables Needed
- **OpenAI API Key** (required - for both GPT-4 and GPT-4 Vision)
- Database connection strings (optional for MVP)
- Optional: Frontend/backend API URLs

### Configuration Files
- **Frontend**: `package.json`, `next.config.js` (if Next.js)
- **Backend**: `package.json` or `requirements.txt`, `.env` for secrets
- **Database**: Migration files or schema definitions

## Technical Constraints

### Performance Requirements
- LLM responses: 3-5 seconds under normal conditions
- Image OCR: May be slower; clear loading indication required
- Math rendering: Should be near-instant (KaTeX advantage)

### Reliability Requirements
- Graceful degradation:
  - Image parsing fails → Prompt user to type problem
  - LLM fails/times out → Friendly error message, allow retry
- No PII required; only math problems
- Secure API key storage on server-side only

### Security Considerations
- **OpenAI API keys** stored server-side only (never in frontend)
- Use environment variables for API key management
- No user authentication required for MVP (can add later)
- Secure file upload handling for images
- Input sanitization for text problems

## Dependencies

### Frontend Dependencies
- **React** (via Vite or Create React App)
- **Tailwind CSS** (required for sketch-style UI)
- KaTeX or MathJax
- HTTP client (fetch or axios)
- Image upload library (react-dropzone or similar)

### Backend Dependencies
- **Express.js** (web framework) - for API server
- **OpenAI SDK** (openai npm package) - for API calls
- **cors** - for CORS configuration (allows frontend requests)
- **dotenv** (environment variable management) - for local development
- **multer** (optional, for Phase 2 image uploads) - or use FormData/Base64
- Database client (optional for MVP)

### Development Dependencies
- TypeScript (recommended for type safety)
- Testing framework (Jest, Vitest, pytest)
- Linting/formatting (ESLint, Prettier, Black)
- Environment variable management (dotenv)

## Development Workflow

1. **Local Development**:
   - Frontend (React): Run `npm run dev` → Runs on localhost:3000 (Vite)
   - Backend (Express): Run `npm run dev:backend` → Runs on localhost:8000
   - Frontend makes API calls to `VITE_API_URL/api/*` (defaults to http://localhost:8000)
   - Backend `.env` file: `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`
   - Frontend `.env.local` file: `VITE_API_URL=http://localhost:8000`
   - Storage: localStorage (client) only for MVP

2. **Testing**:
   - Unit tests for math validation
   - Integration tests for API endpoints
   - End-to-end tests for Socratic dialogue flow

3. **Deployment**:
   - Single Vercel deployment for both frontend and backend
   - Frontend: React build (`npm run build`) → Vercel static hosting
   - Backend: `/api` directory → Vercel serverless functions (auto-deployed)
   - Environment variables: Set `OPENAI_API_KEY` in Vercel dashboard
   - Database: Optional - localStorage (client) only for MVP

## Known Technical Decisions Needed

1. **Language Choice**: ✅ **Node.js** (JavaScript/TypeScript)
   - Unified ecosystem with React frontend
   - Express.js for simple, fast backend setup
   - Single-day build friendly

2. **Database Choice**: Postgres vs Firestore
   - Postgres: Better for relational queries, complex state
   - Firestore: Better for serverless, real-time updates

3. **Math Rendering**: KaTeX vs MathJax
   - KaTeX: Faster, smaller bundle
   - MathJax: More LaTeX features, better for complex math

4. **LLM Provider**: ✅ **Decided - OpenAI API**
   - GPT-4 for chat and validation
   - GPT-4 Vision for OCR
   - Single API key for all services

