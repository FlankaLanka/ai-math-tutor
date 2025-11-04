# System Patterns: Architecture & Design

## System Architecture

The system follows a **client-server architecture** with clear separation of concerns:

```
Browser Client (React App on Vercel)
    ↓
Express.js Backend API (Railway/Render)
    ↓
OpenAI API Services (GPT-4 + GPT-4 Vision)
    ↑
Storage (localStorage on client)
```

## Component Relationships

### 1. Client Layer (React Browser App)
- **Chat UI**: React interface for text/image input
- **Styling**: Tailwind CSS with sketch/doodle style aesthetic
  - Hand-drawn borders, organic shapes, playful design
  - Sketch-style components (buttons, inputs, cards, chat bubbles)
- **Math Renderer**: KaTeX for LaTeX rendering (user messages, tutor responses, problem display)
- **Whiteboard**: Konva.js-based drawing canvas with pen tool and image overlay
- **Voice Interface**: OpenAI TTS API and Web Speech API for speech input/output
- **Avatar**: Animated 2D character with speaking animation synced to audio
- **API Communication**: Makes HTTP requests to Express backend API
- **Responsibilities**:
  - Display conversation history (tutor vs student) with sketch-style chat bubbles
  - Handle text input and image uploads with hand-drawn UI elements
  - Whiteboard drawing with pen tool and image overlay
  - Capture and compress whiteboard snapshots for AI context
  - Voice input/output with toggle controls
  - Animated avatar synchronized with TTS audio
  - Make API calls to backend endpoints (`/api/chat`, `/api/vision`, `/api/validate`, `/api/tts`)
  - Render math expressions from LaTeX (supports `$$...$$`, `$...$`, `\[...\]`, `\(...\)`)
  - Convert LaTeX to natural language for TTS
  - Display reference image next to problem in chat interface
  - Show loading states and OCR previews with playful, sketch-style animations
  - OCR confirmation with image display and LaTeX preview
  - Store conversation history in localStorage

### 2. Backend API Layer (Express.js)
- **Server**: Express.js REST API server
- **API Routes** in `backend/routes/`:
  - `/api/chat` - Socratic dialogue generation with whiteboard support (✅ implemented)
  - `/api/vision` - Image OCR extraction (✅ implemented)
  - `/api/validate` - Answer validation (✅ implemented)
  - `/api/tts` - Text-to-speech using OpenAI TTS API (✅ implemented)
- **Shared Utilities** in `backend/lib/`:
  - `orchestrator.js` - Core Socratic dialogue engine with image context management, stuck detection, output filtering
  - `validation.js` - Answer validation and stuck detection utilities
  - `openai.js` - OpenAI client setup
- **Orchestrator**: Core Socratic dialogue engine
  - Builds prompts with conversation context
  - Manages image context (reference image in conversation history)
  - Handles whiteboard snapshots for visual context
  - Preserves images in conversation history for AI awareness
  - Implements stuck detection and hint escalation logic
  - Enforces "no direct answers" guardrails with output filtering
  - Validates student answers before affirming (strict validation rules)
  - Model selection: `gpt-4o` for vision (images or whiteboard), `gpt-4` for text-only
- **Conversation Store**: localStorage on client (no server-side storage)
- **Math Validation Module**: Validates student answers using OpenAI GPT-4 (LLM-as-judge)
- **Security**: OpenAI API keys stored in backend environment variables (never exposed to client)
- **CORS**: Configured to allow requests from Vercel frontend URL
- **Body Size Limits**: Increased to 50MB for large images and whiteboard snapshots

### 3. OpenAI API Services
- **GPT-4**: Generates Socratic tutor responses and validates answers
- **GPT-4 Vision**: Extracts text from uploaded images (OCR)

### 4. Database / Storage Layer
- For MVP: In-memory or localStorage (client-side)
- Optional for production: Database (Postgres/Firestore)
- Stores: Sessions, Turns, State
- Persists conversation history and tutor progress

## Key Design Patterns

### Socratic Orchestration Pattern

**System Prompt Structure**:
- Fixed role: "You are a patient math tutor. NEVER give direct answers..."
- Context includes: Original problem, conversation history, current step
- Output filtering: Guardrails to prevent direct final answers

**State Management**:
- Each problem session maintains:
  - Original problem text
  - Conversation history (turns)
  - Solution state (current step)
- Backend sends relevant history + state to LLM each turn

### Question-First Response Pattern

Every tutor response follows this structure:
1. Brief reflection (1-2 sentences max)
2. Follow-up questions that move student forward

**Adaptation Logic**:
- Correct answer → Acknowledge, move to next step
- Incorrect answer → Gentle feedback, ask simpler question
- Stuck (2+ incorrect/"I don't know") → Provide concrete hint (partial step only)

### Hint Escalation Pattern ✅ IMPLEMENTED

**Stuck Detection** (implemented in `validation.js`):
- Detects patterns: "I don't know", "I'm stuck", "I have no idea", "I can't do this", etc.
- Counts consecutive stuck signals in recent conversation (last 6 messages)
- Triggers after 2+ consecutive stuck signals

**Response**:
- Normal: Guiding questions
- 2+ stuck signals: Concrete partial step hints (e.g., "Try isolating x on one side")
- 3+ stuck signals: More detailed hints (e.g., "Start by subtracting 5 from both sides")
- Never reveals final numeric/algebraic answer
- System prompt dynamically enhanced when stuck detected

**Implementation**:
- `detectStuck()` function analyzes conversation history
- Returns `{ isStuck, stuckCount, reason }`
- Orchestrator uses this to adjust system prompt

### Answer Validation Pattern ✅ IMPLEMENTED

**Validation Methods** (using OpenAI GPT-4 as judge):
- Endpoint: `POST /api/validate`
- Numeric answers: Use GPT-4 to compare student's answer to expected result (with tolerance for decimals)
- Algebraic answers: Use GPT-4 to evaluate correctness (LLM-as-judge approach)
- Partial answers: Evaluates if student is on the right track
- Returns: `{ isCorrect, feedback, confidence }`
- No separate math library needed - all validation through OpenAI API

**Usage**:
- Confirm correctness
- Provide targeted hints when incorrect
- Can be called by frontend for real-time validation (optional)

**Validation Rules in System Prompt**:
- NEVER affirm student answers without verifying against problem/image
- Must check answer against actual problem statement, image, diagram, or given data
- If unverified: Ask student to verify, recalculate, or look more carefully
- Only use affirmative language ("Yes!", "Great!") when verified as correct
- Generic rules apply to all math problem types (not just graphs)

### Output Filtering Pattern ✅ IMPLEMENTED

**Purpose**: Prevent direct answers from being given

**Detection**:
- Regex-based pattern matching for direct answer phrases
- Patterns: "The answer is X", "The solution is X", "It's X", "x = number" (standalone)
- Only filters very explicit direct answers (not guidance or acknowledgments)

**Filtering**:
- Replaces direct answers with Socratic questions
- Logs warnings when filtering occurs
- Only filters short, explicit statements (not longer explanations)

**Implementation**:
- `filterDirectAnswers()` function in orchestrator
- Applied to all tutor responses before returning

### Scaffolding Adaptation Pattern

**Inference** (simple rules/heuristics for MVP):
- Student level inferred from:
  - Accuracy of responses
  - Frequency of "I don't know"
  - Time spent on each step (if available)

**Behavior**:
- Struggling → Break steps into smaller chunks, use concrete examples
- Doing well → Skip trivial steps, use more concise prompts

## Data Flow Patterns

### Text Problem Flow
1. User inputs text in React frontend (localhost:3000 or Vercel)
2. React → HTTP POST to `VITE_API_URL/api/chat` (Express backend)
3. Express API → Orchestrator (builds prompt with system rules + conversation history)
4. Orchestrator → OpenAI GPT-4 (gets Socratic response)
5. GPT-4 → Orchestrator → Express API → React UI (rendered with math via KaTeX)

### Contextual Awareness Pattern (Image Context)
**Key Implementation**: Reference image maintained in conversation history, not system messages
1. First image upload: Stored in conversation history as user message with image
2. Subsequent messages: Reference image included from conversation history (not re-sent)
3. AI maintains visual context: Image is in conversation flow, accessible throughout dialogue
4. Efficiency: Image sent once in history, not with every message (reduces token usage)
5. Model selection: Uses `gpt-4o` (vision-capable) when any image exists, otherwise `gpt-4`

### Image Problem Flow (Phase 2) ✅ IMPLEMENTED
1. User uploads image in React frontend (ImageUpload component)
2. React → Convert image to base64 → HTTP POST to `VITE_API_URL/api/vision` (Express backend)
3. Express API → OpenAI GPT-4 Vision (extracts text via OCR)
4. GPT-4 Vision → Express API → React UI (displays extracted text + image in OCRConfirmation)
5. User confirms/edits in React UI → Problem stored with image reference
6. Standard text flow continues (via `/api/chat`) with image in conversation history
7. Reference image displayed in chat interface next to problem
8. AI maintains visual context through conversation history (not re-sent every message)

### Whiteboard Flow ✅ IMPLEMENTED
1. User draws on whiteboard using pen tool (Konva.js canvas)
2. User can overlay problem image on whiteboard (draggable/resizable)
3. When user sends message, whiteboard snapshot automatically captured
4. Snapshot compressed (downscaled to 1200px, JPEG 70% quality) to reduce size
5. Compressed snapshot sent to backend with message
6. Backend receives whiteboard image with `whiteboard: true` flag
7. Orchestrator includes whiteboard in GPT-4 Vision context
8. AI analyzes whiteboard content for visual understanding of student's work
9. AI provides feedback based on what's actually written on whiteboard

### Voice Interface Flow ✅ IMPLEMENTED
1. User enables voice input (toggle button)
2. Web Speech API captures microphone input
3. Speech converted to text and sent as message
4. Tutor responds with text
5. If voice output enabled, text sent to `/api/tts` endpoint
6. OpenAI TTS API generates audio
7. Audio played back with volume control
8. Avatar animation synced to audio levels (Web Audio API monitoring)
9. LaTeX expressions converted to natural language before TTS

### Answer Validation Flow (Phase 3) ✅ IMPLEMENTED
1. Student provides answer (can be validated via `/api/validate` endpoint)
2. React → HTTP POST to `VITE_API_URL/api/validate` (Express backend) - Optional
3. Express API → `validateAnswer()` function in `validation.js`
4. `validateAnswer()` validates using OpenAI GPT-4 (LLM-as-judge)
5. Returns `{ isCorrect, feedback, confidence }` to frontend
6. Frontend can use this for real-time feedback or display validation results

### Stuck Detection Flow (Phase 3) ✅ IMPLEMENTED
1. Student sends message indicating stuck state ("I don't know", "I'm stuck", etc.)
2. Orchestrator calls `detectStuck()` before generating response
3. `detectStuck()` analyzes recent conversation history (last 6 messages)
4. Counts consecutive stuck signals
5. If 2+ stuck signals: System prompt enhanced with stuck context
6. Orchestrator generates response with more concrete hints
7. Response includes `stuckInfo` in API response for frontend use

## Modular Separation

Clear boundaries between:
- **Frontend UI**: Presentation and user interaction
- **Backend API**: Request handling and routing
- **LLM/Socratic Orchestrator**: Dialogue logic and prompt engineering
- **OCR/Vision Integration**: Image processing
- **Math Validation**: Answer checking logic

All components are **config-driven** for model choice, prompts, and hint behaviors.

