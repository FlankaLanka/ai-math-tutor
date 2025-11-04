# AI Math Tutor – Architecture

```mermaid
flowchart LR
    subgraph Client["Browser Client (React App)"]
        UI[Chat UI + Problem Input<br/>(React + Tailwind CSS)]
        MathRender[Math Renderer<br/>(KaTeX/MathJax)]
        StepViz[Step Visualization<br/>(Animated Breakdown)]
        Voice[Voice Interface<br/>(Text-to-Speech + Speech-to-Text)]
        Avatar[Animated Avatar<br/>(2D/3D Character)]
    end

    subgraph Backend["Express.js Backend API Server"]
        API[API Routes<br/>(/api/chat, /api/vision, /api/validate, /api/generate)]
        Orchestrator[Socratic Orchestrator<br/>(Prompt Builder + State Manager)]
        ConvStore[Conversation Store<br/>(localStorage on client)]
        MathCheck[Math Validation Module<br/>(OpenAI GPT-4 LLM-as-judge)]
        ProblemGen[Problem Generator<br/>(OpenAI GPT-4)]
    end

    subgraph AI["OpenAI API Services"]
        LLM[OpenAI GPT-4<br/>(Socratic Tutor + Validation + Problem Generation)]
        VisionLLM[OpenAI GPT-4 Vision<br/>(Image → Text OCR)]
    end

    DB[(Database<br/>(Postgres/Firestore/etc.))]

    UI -->|Text Input / Image Upload| API
    UI -->|Render LaTeX| MathRender
    UI -->|Display Steps| StepViz
    UI -->|Voice I/O| Voice
    UI -->|Character Display| Avatar

    API --> Orchestrator
    API --> ConvStore
    API --> ProblemGen
    Orchestrator --> ConvStore

    %% Text-based problems
    Orchestrator -->|Build Prompt + Context| LLM
    LLM -->|Tutor Response + LaTeX| Orchestrator

    %% Image-based problems
    API -->|Image| VisionLLM
    VisionLLM -->|Extracted Problem Text| Orchestrator

    %% Answer checking
    Orchestrator --> MathCheck
    MathCheck --> Orchestrator

    %% Problem generation
    ProblemGen -->|Generate Variations| LLM
    LLM -->|Similar Problems| ProblemGen

    %% Persistence
    ConvStore --> DB
    DB --> ConvStore

    Orchestrator --> API
    API --> UI
```

## Component Overview

### Client (React Web App)
- **React** frontend with Vite or Create React App.
- Chat interface for text/image input with **sketch/doodle style** design.
- **Tailwind CSS** for styling with hand-drawn borders, organic shapes, and playful aesthetic.
- Math rendering via KaTeX/MathJax.
- **Step Visualization**: Animated breakdown of solution steps with React animations.
- **Voice Interface**: Text-to-speech (SpeechSynthesis) and speech-to-text (SpeechRecognition) using browser Web Speech API.
- **Animated Avatar**: 2D/3D tutor character with expressions (Lottie, Three.js, or CSS animations).
- Displays tutor/student turns and OCR preview with sketch-style UI elements.
- Makes HTTP requests to backend API endpoints.

### Backend API Server (Express.js/Node.js)
- **Express.js/Node.js** API server for handling OpenAI API calls securely.
- API routes:
  - `/api/chat` - Socratic dialogue generation
  - `/api/vision` - Image OCR extraction
  - `/api/validate` - Answer validation
  - `/api/generate` - Problem generation (similar practice problems)
- Orchestrator logic (shared utilities) handles prompt construction, hint logic, and conversation context.
- MathCheck validates answers using OpenAI GPT-4 (LLM-as-judge approach).
- Problem Generator creates similar practice problems using OpenAI GPT-4.
- ConvStore persists conversation state in localStorage on client (no server-side storage needed).
- **OpenAI API keys** stored securely in backend environment variables (never exposed to client).
- **Separate deployment** - Frontend on Vercel, backend on Railway/Render.

### OpenAI API Services
- **GPT-4 Vision**: Image → text extraction (OCR from screenshots).
- **GPT-4**: Socratic dialogue generation, answer validation (LLM-as-judge), and problem generation.
- All API calls use OpenAI's standard chat completion and vision APIs.
- API keys managed securely on server-side only.

### Database / Storage
- For MVP: In-memory storage or localStorage (client-side) for session persistence.
- Optional: Database (Postgres/Firestore) for production.
- Stores conversation history and tutor progress state.
