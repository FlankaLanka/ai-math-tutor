# Active Context: Current Work Focus

## Current Phase

**Implementation Phase - All Core Features Complete** ✅ - All major features implemented including whiteboard, voice interface, and avatar. Project is fully functional.

## Recent Changes

- ✅ **Phase 1 Complete**: React frontend + Express.js backend fully implemented
- ✅ **Phase 2 Complete**: Image upload & OCR with GPT-4 Vision working
- ✅ **Phase 3 Complete**: Answer validation, stuck detection, hint escalation, and output filtering
- ✅ **Voice Interface & Avatar**: OpenAI TTS API, Web Speech API for STT, animated avatar with speaking animation
- ✅ **Whiteboard**: Konva.js-based drawing tool with pen, image overlay, draggable/resizable elements, snapshot capture
- ✅ **Answer Validation**: `/api/validate` endpoint using OpenAI GPT-4 (LLM-as-judge)
- ✅ **Stuck Detection**: Automatically detects when students are stuck (2+ consecutive signals)
- ✅ **Hint Escalation**: Progressive hints become more concrete when stuck
- ✅ **Output Filtering**: Prevents direct answers from being given
- ✅ **Validation Rules**: Strict rules to verify student answers before affirming
- ✅ **Contextual Awareness**: Reference image maintained in conversation history for AI context
- ✅ **Whiteboard Context**: Whiteboard snapshots sent to AI with each message for visual context
- ✅ **Image Handling**: Fixed to avoid sending images with every message (efficiency & cost optimization)
- ✅ **Image Compression**: Whiteboard snapshots compressed before sending (downscaled to 1200px, JPEG 70% quality)
- ✅ **Backend Limits**: Increased body size limit to 50MB for large images
- ✅ **LaTeX Rendering**: Added to OCR confirmation screen and "Current Problem" display
- ✅ **LaTeX to Speech**: Custom conversion for TTS to read math expressions correctly
- ✅ **UI Improvements**: Larger chat container, 50/50 split for problem and image boxes
- ✅ **Project Structure**: Frontend (React/Vite) and backend (Express.js) set up
- ✅ **UI Implementation**: Sketch-style UI with Kalam/Caveat fonts, refined borders
- ✅ **API Integration**: `/api/chat`, `/api/vision`, `/api/validate`, and `/api/tts` endpoints working
- ✅ **Socratic Orchestrator**: Enhanced with image context management, stuck detection, validation, and whiteboard support
- ✅ **Math Rendering**: KaTeX integrated for LaTeX math expressions (user messages too)
- ✅ **Environment Setup**: Configuration for local development and deployment
- **Architecture Decision**: Express.js backend for simplicity (not Vercel serverless)
- **Deployment Strategy**: Frontend on Vercel, backend on Railway/Render (separate deployment)

## Current Work Focus

**All Major Features Complete**: Full-featured tutoring system with advanced UI capabilities:
- ✅ Image upload with OCR (GPT-4 Vision)
- ✅ Reference image display in UI
- ✅ Contextual awareness for AI (image in conversation history)
- ✅ Whiteboard with drawing tools and image overlay
- ✅ Whiteboard snapshots sent to AI for visual context
- ✅ Voice interface with OpenAI TTS and Web Speech API STT
- ✅ Animated avatar with speaking animation synced to audio
- ✅ Answer validation with LLM-as-judge
- ✅ Stuck detection and hint escalation
- ✅ Output filtering to prevent direct answers
- ✅ Strict validation rules for all problem types
- ✅ LaTeX rendering in all relevant places
- ✅ LaTeX to speech conversion for TTS
- ✅ Optimized image handling (compression, no duplicate sends)

## Next Steps (Immediate)

1. **Testing & Refinement**:
   - Test with various problem types and images
   - Verify answer validation works correctly
   - Test stuck detection and hint escalation
   - Ensure validation rules prevent incorrect affirmations
   - Verify output filtering catches direct answers

2. **Technology Stack** (All Decided):
   - ✅ **Frontend**: React + Vite + Tailwind CSS (deployed on Vercel)
   - ✅ **Backend**: Express.js/Node.js (deployed on Railway/Render)
   - ✅ **Fonts**: Kalam & Caveat (Google Fonts) for sketch-style
   - ✅ **Storage**: localStorage for MVP (client-side only)
   - ✅ **AI Services**: OpenAI API (GPT-4 + GPT-4 Vision)

3. **Current Setup**:
   - ✅ Project structure complete
   - ✅ Development environment configured
   - ✅ Environment variables documented
   - ✅ Basic chat interface working

## Active Decisions & Considerations

- **AI Services**: ✅ **Decided - Using OpenAI API exclusively**
  - GPT-4 for Socratic dialogue and answer validation
  - GPT-4 Vision for image/OCR extraction
- **Architecture Choice**: ✅ **Separate frontend/backend repos** (or monorepo - both work)
  - Frontend: React app (separate directory/repo)
  - Backend: Express.js API server (separate directory/repo)
- **Storage**: For MVP, use in-memory or localStorage (client-side). Database optional for production.
- **Math Rendering**: KaTeX vs MathJax - KaTeX is faster, MathJax has broader LaTeX support
- **Deployment Strategy**: ✅ **Vercel (frontend) + Railway/Render (backend)**
  - Frontend: Vercel (static React build, free tier)
  - Backend: Express.js server on Railway (recommended) or Render
  - Separate deployments but simpler local development
  - CORS configured in Express backend
  - Environment variables: `VITE_API_URL` (frontend), `OPENAI_API_KEY` & `FRONTEND_URL` (backend)

## Blockers

None currently - project is ready to begin implementation.

## Notes

- This is a **core MVP** focused on single-day build (5 phases)
- Using **OpenAI API exclusively** for all AI capabilities
- **Phase 1 Complete**: Basic chat flow working with sketch-style UI
- **UI Design**: Kalam/Caveat fonts for sketch aesthetic, refined borders (2px/1.5px)
- Express.js backend chosen for simpler local development (vs Vercel serverless)
- Stretch features (whiteboard, voice, avatar) are explicitly out of scope for v1
- Success depends on maintaining strict "no direct answers" policy throughout implementation

