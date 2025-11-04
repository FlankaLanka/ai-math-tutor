# AI Math Tutor – Core Tasks

> Timeline: Extended build (originally single day, now expanded with additional features). All tasks to be completed in priority order.

## Phase 1 – Project Setup & Basic Chat Flow
- Initialize React frontend (Vite or CRA) with Tailwind CSS.
- Set up Vercel project structure with `/api` directory for serverless functions.
- Create basic chat UI with sketch-style design.
- Create Vercel serverless function: `/api/chat.js`.
- Implement OpenAI GPT-4 integration in serverless function (secure API key storage).
- Connect React frontend to `/api/chat` endpoint.
- Implement Socratic prototype with hardcoded example.
- Verify multi-turn flow works.
- Configure OpenAI API keys in Vercel environment variables (never commit to git).

## Phase 2 – Image Upload & OCR
- Add image upload UI component (React).
- Create Vercel serverless function: `/api/vision.js` for image upload.
- Implement file upload handling in serverless function (convert to base64).
- Connect serverless function to OpenAI GPT-4 Vision API for OCR.
- Return extracted text to frontend.
- Display extracted text in sketch-style confirmation UI.
- Allow editing before tutoring starts.
- Handle image format validation and error cases.

## Phase 3 – Socratic Orchestrator & Validation
- Add orchestration logic for system prompt, hinting, and step tracking.
- Implement answer validation via OpenAI GPT-4 (LLM-as-judge).
- Handle "stuck" detection and hint escalation.
- Enforce "no direct answers" guardrails using OpenAI moderation/filtering.

## Phase 4 – Step Visualization
- Create React component for animated step-by-step breakdown.
- Integrate animation library (Framer Motion or CSS animations).
- Display solution steps with visual progression.
- Highlight current step being worked on.
- Show step transitions with smooth animations.
- Integrate with sketch-style UI aesthetic.
- Connect step visualization to tutor responses.

## Phase 5 – Voice Interface
- Implement text-to-speech for tutor responses using browser Web Speech API (SpeechSynthesis).
- Add speech-to-text for student input using browser Web Speech API (SpeechRecognition).
- Create voice toggle buttons in UI (microphone for input, speaker for output).
- Add visual indicators when voice is active (recording animation, speaking animation).
- Handle browser compatibility and graceful fallback to text if voice APIs unavailable.
- Integrate voice controls with sketch-style UI.
- Test voice input/output across different browsers.

## Phase 6 – Animated Avatar
- Design or integrate 2D/3D tutor character (can use Lottie for 2D, Three.js for 3D, or CSS animations).
- Create different avatar expressions/animations:
  - Encouraging/positive expression
  - Thinking/pondering expression
  - Celebrating expression
- Connect avatar expressions to conversation state.
- Integrate avatar display in chat interface (alongside or within chat).
- Match avatar style to sketch/doodle aesthetic (playful, hand-drawn character preferred).
- Add animation transitions between expressions.

## Phase 7 – Problem Generation
- Create backend endpoint: `/api/generate` for problem generation.
- Implement problem generator using OpenAI GPT-4.
- Generate similar practice problems based on original problem:
  - Same problem type but different numbers
  - Similar difficulty level
  - Maintains same mathematical concepts
- Display generated problems in sketch-style UI.
- Allow student to start new tutoring session with generated problem.
- Add "Generate Similar Problem" button/option after solving a problem.
- Store generated problems for student reference.

## Phase 8 – UI Polish & Math Rendering
- Set up Tailwind CSS for sketch/doodle style UI.
- Implement sketch-style components (chat bubbles, buttons, inputs, cards).
- Create hand-drawn borders and organic shapes using Tailwind utilities.
- Integrate KaTeX/MathJax for math rendering in React.
- Parse LaTeX from OpenAI responses (GPT-4 outputs LaTeX).
- Improve chat layout with sketch-style design.
- Add playful, hand-drawn loading states and animations.
- Display original problem at top with sketch-style card.
- Test 5+ problem types end-to-end.

## Phase 9 – Persistence & Polish
- Implement localStorage in React frontend for conversation history.
- Create shared utilities folder for orchestrator logic (used by all API routes).
- Write README + setup instructions for Vercel deployment.
- Create `.env.example` file with required environment variables.
- Prepare for deployment:
  - **Frontend**: Vercel deployment configuration
    - Connect GitHub repo
    - Set build command `npm run build`, output directory `dist` (Vite)
    - Add environment variable `VITE_API_URL` (backend URL)
  - **Backend**: Railway/Render deployment configuration
    - Connect GitHub repo
    - Set root directory to `backend`
    - Set start command `npm start`
    - Add environment variables: `OPENAI_API_KEY`, `FRONTEND_URL`, `PORT`
    - Configure CORS for Vercel frontend URL
- Optional: Set up database for production (Postgres/Firestore).

## Phase 10 – Interactive Whiteboard
- Create React component for HTML5 Canvas whiteboard.
- Implement drawing tools:
  - Pen tool for freehand drawing
  - Canvas stroke rendering with mouse/touch events
  - Sketch-style drawing appearance to match UI aesthetic
- Implement problem image overlay:
  - Display uploaded problem image on canvas as texture/background
  - Allow student to drag and reposition image
  - Allow student to scale/resize image
  - Enable drawing over the image
- Add whiteboard panel underneath chat interface:
  - Separate scrollable area for whiteboard
  - Toggle to show/hide whiteboard (optional)
  - Sketch-style borders and styling
- Implement automatic snapshot capture:
  - Capture canvas as image (base64) when student sends message
  - Send whiteboard snapshot along with text message to backend
  - Include snapshot in conversation history
- Update backend `/api/chat` endpoint:
  - Accept optional whiteboard snapshot image
  - Pass whiteboard image to orchestrator
  - Include whiteboard in GPT-4 Vision context for visual understanding
- Update orchestrator to handle whiteboard images:
  - Include whiteboard snapshot in conversation history (similar to problem images)
  - Pass whiteboard to GPT-4 Vision when available
  - Agent can see but not interact with whiteboard
- Test whiteboard integration:
  - Drawing functionality
  - Image overlay and manipulation
  - Snapshot capture and transmission
  - Agent visual context understanding
- Integrate with sketch-style UI aesthetic.
