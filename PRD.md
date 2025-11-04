# AI Math Tutor – Socratic Learning Assistant (Core)

## 1. Overview

Build a web-based AI math tutor that guides students through problems using **Socratic questioning**, not direct answers. The system accepts math problems as **text** or **screenshots** and walks students through solving them step-by-step, adapting to their understanding.

This PRD covers the **core features and extended enhancements**, including step visualization, voice interface, animated avatar, and problem generation.

**Technology Stack**: This implementation uses **OpenAI API** for all AI capabilities:
- **GPT-4** for Socratic dialogue, tutoring, answer validation (LLM-as-judge), and problem generation
- **GPT-4 Vision** for image/OCR extraction

**Frontend**: **React** with **Tailwind CSS** for sketch/doodle style UI:
- React (Vite or Create React App) for fast development
- Tailwind CSS for utility-first styling
- Hand-drawn, playful appearance with organic shapes
- Rough borders and informal design elements
- Playful, approachable appearance suitable for students

**Backend**: **Express.js/Node.js API Server**:
- Express.js API server for secure OpenAI API access
- API routes: `/api/chat`, `/api/vision`, `/api/validate`, `/api/generate`
- API keys stored in backend environment variables (never exposed to client)
- Handles all OpenAI API calls from Express server
- Separate deployment: Frontend on Vercel, backend on Railway/Render
- CORS configured for frontend-backend communication

---

## 2. Objectives & Success Criteria

### 2.1 Objectives

- Help students **discover** solutions via guided questioning (Socratic method).
- Support **5+ math problem types**:
  - Simple arithmetic
  - Linear equations / basic algebra
  - Basic geometry
  - Word problems
  - Multi-step problems (e.g., combine arithmetic + reasoning)
- Handle **both text and image input** (printed math problem screenshots).
- Maintain **conversation context** across turns.
- Adapt scaffolding and hints based on student's responses.

### 2.2 Success Criteria

- Tutor **never gives direct final answers**; always uses questions and hints.
- Handles at least **5 example problems** end-to-end without breaking character.
- Correctly parses image-based problems (printed text) for at least **80%** of clean screenshots.
- Conversations remain coherent over **10+ turns** for a single problem.
- Students can complete at least **one full solution path** (from problem input to correct solution) in each problem category.

---

## 3. Users & Use Cases

### 3.1 Primary User

- **Middle to early high school student** (Grade 6–10 equivalent) struggling with math homework.
- Has basic familiarity with typing, uploading images, and web apps.

### 3.2 Key Use Cases

1. **Text Problem Input**
   - Student types a problem like `2x + 5 = 13`.
   - Tutor parses the input, restates the problem, and begins Socratic questioning.

2. **Screenshot Input (Printed Homework / Textbook)**
   - Student uploads a screenshot of a printed problem.
   - System uses a vision/OCR model to extract text and display the recognized problem.
   - Tutor confirms the parsed problem with the student and starts guidance.

3. **Multi-step Algebra Problem**
   - Student inputs a system like:
     - `"Solve for x: 3(x - 2) + 4 = 19"`.
   - Tutor guides through distributing, simplifying, isolating x, and checking the solution.

4. **Geometry Problem**
   - Student inputs a word problem involving e.g. the area of a rectangle or triangle.
   - Tutor helps identify knowns, unknowns, relevant formulas, and compute.

5. **Word Problem / Application Problem**
   - Student uploads or types a sentence-based problem (e.g., “Sam has twice as many apples…”).
   - Tutor helps translate the story into equations, solve, and interpret.

---

## 4. Functional Requirements

### 4.1 Problem Input

**FR-1. Text Input**
- User can enter a math problem in a text box.
- Basic formatting like `^` for exponents and `/` for fractions allowed; system may reformat to LaTeX.

**FR-2. Image Upload**
- User can upload an image (PNG/JPEG) containing printed text (homework sheet, textbook screenshot).
- System sends the image to **OpenAI GPT-4 Vision API** for text extraction.
- Extracted text is shown to the user for confirmation before tutoring begins.
- If OCR confidence is low or incomplete, system asks the user to correct or retype.

### 4.2 Socratic Dialogue Engine

**FR-3. System Prompt & Role**
- The tutor uses a fixed system prompt like:
  - “You are a patient math tutor. NEVER give direct answers. Guide through questions… If the student is stuck for more than 2 turns, provide a concrete hint. Use encouraging language.”
- System must enforce “no direct final answer” at the orchestration layer (e.g., output filter / guardrails).

**FR-4. Multi-turn Conversation & Context**
- Each problem session maintains:
  - Original problem text
  - Conversation history
  - A simple “solution state” (which step we’re on)
- Backend sends relevant history and state to the LLM each turn.

**FR-5. Question-First Behavior**
- Tutor always responds with:
  - A brief reflection or summary (1–2 sentences max)
  - Follow-up questions that move the student forward
- When student answers correctly, tutor acknowledges and moves to the next step.
- When student answers incorrectly, tutor:
  - Gives gentle feedback
  - Asks a simpler or more concrete question

**FR-6. “Stuck” Detection and Hints**
- If the student:
  - Gives incorrect answers or says “I don’t know” for **2 consecutive turns** on the same step, or
  - Asks explicitly “just tell me the answer”
- Then tutor:
  - Provides a **concrete hint** (partial step, not the full solution).
  - Encourages trying again with that hint.
- Tutor **still does not reveal the final numeric/algebraic answer**, only intermediate guidance.

**FR-7. Basic Answer Validation**
- For numeric answers:
  - Use **OpenAI GPT-4** as a judge to compare student's answer to expected result (within small tolerance for decimals).
- For algebraic answers:
  - Use **OpenAI GPT-4** to evaluate correctness (e.g., "Is 'x = 2' correct for this equation?").
- Tutor uses validation to:
  - Confirm correctness
  - Provide targeted hints when incorrect.

### 4.3 Adaptation to Understanding

**FR-8. Scaffolding Level**
- Tutor infers approximate student level from:
  - Accuracy of responses
  - Frequency of “I don’t know”
  - Time spent on each step (optional if available)
- Behavior:
  - If struggling: break steps into smaller chunks, use concrete examples.
  - If doing well: skip trivial steps, use more concise prompts.

(MVP can implement this as simple rules / heuristics; no complex personalization needed.)

### 4.4 Math Rendering & UI

**FR-9. Math Rendering**
- Use LaTeX/KaTeX (or MathJax) to render:
  - Original problem
  - Tutor messages when they contain math
- LLM outputs math in LaTeX blocks `$$ ... $$` or `\( ... \)`.
- Frontend parses and renders these.

**FR-10. Web Chat Interface (Sketch Style)**
- **Design Aesthetic**: Hand-drawn, sketch/doodle style using Tailwind CSS
  - Chat bubbles with rough, hand-drawn borders (using CSS `border-radius` with organic variations)
  - Playful, informal appearance with sketch-style shadows
  - Hand-drawn style buttons and input fields
  - Organic, slightly irregular shapes throughout
  - Friendly, approachable visual language suitable for students
- **Layout**:
  - Conversation area (chat bubbles: tutor vs student) with sketch-style borders
  - Bottom: input bar with sketch-style design:
    - Text input with hand-drawn border treatment
    - Send button with sketch-style appearance
    - Image upload button with doodle-style icon
- **Visual Elements**:
  - Original problem displayed at top with sketch-style card/container
  - Uploaded image preview with hand-drawn frame/border
  - OCR text confirmation in sketch-style text box
  - Loading state with playful, hand-drawn animations (e.g., doodle spinner)
- **Tailwind CSS Implementation**:
  - Use Tailwind utility classes for layout, spacing, and colors
  - Custom sketch-style borders using Tailwind border utilities with rounded, organic shapes
  - Hand-drawn appearance achieved through CSS transforms, shadows, and border-radius variations
  - Sketch-style typography (consider playful fonts or hand-drawn text effects)
  - Responsive design using Tailwind breakpoints
- **Accessibility**: Despite sketch aesthetic, maintain clear contrast, readable fonts, and proper semantic HTML
- Support local session history (refresh-safe if possible).

**FR-11. Step Visualization**
- Display animated breakdown of solution steps as the tutor guides the student.
- Show step-by-step progression with visual animations.
- Highlight current step being worked on.
- Use CSS animations or React animation libraries (e.g., Framer Motion) for smooth transitions.
- Visual representation should be clear and educational, helping students understand the solution process.
- Integrate with sketch-style UI aesthetic.

**FR-12. Voice Interface**
- **Text-to-Speech**: Tutor responses can be read aloud using browser Web Speech API (SpeechSynthesis).
- **Speech-to-Text**: Student can speak their answers instead of typing using browser Web Speech API (SpeechRecognition).
- Optional toggle buttons for voice input/output.
- Graceful fallback to text if voice APIs are not available.
- Visual indicators when voice is active (microphone icon, speaking animation).

**FR-13. Animated Avatar**
- Display a 2D/3D tutor character with expressions and animations.
- Avatar shows different expressions based on conversation state:
  - Encouraging/positive when student is progressing
  - Thinking/pondering when waiting for student response
  - Celebrating when student answers correctly
- Can use animation libraries (Lottie for 2D, Three.js for 3D, or simple CSS animations).
- Integrate with sketch-style aesthetic (playful, hand-drawn character style preferred).
- Avatar appears alongside or within chat interface.

**FR-14. Problem Generation**
- After solving a problem, offer to generate similar practice problems.
- Use OpenAI GPT-4 to create variations of the original problem:
  - Same problem type but different numbers
  - Similar difficulty level
  - Maintains same mathematical concepts
- Display generated problems in sketch-style UI.
- Allow student to start a new tutoring session with the generated problem.
- Helps students practice and reinforce learning.

---

## 5. Non-Functional Requirements

**NFR-1. Performance**
- LLM responses usually within ~3–5 seconds under normal conditions.
- Image OCR may be slower; show clear loading indication.

**NFR-2. Reliability**
- If image parsing fails, degrade gracefully to “please type the problem”.
- If LLM fails or times out, show a friendly error and allow retry.

**NFR-3. Security & Privacy**
- No PII required; only math problems.
- Do not log user identifiers beyond what is needed for session management.
- **OpenAI API keys** must be stored securely on server-side only (never exposed to client).
- Use environment variables for API key management.

**NFR-4. Maintainability**
- Clear modular separation:
  - Frontend UI (Tailwind CSS with sketch-style components, step visualization, voice interface, avatar)
  - Backend API (Express.js server)
  - LLM/Socratic orchestrator (OpenAI GPT-4 integration)
  - OCR/vision integration (OpenAI GPT-4 Vision)
  - Problem generation module (OpenAI GPT-4)
- Config-driven prompts, hint behaviors, and OpenAI model parameters (temperature, max_tokens, etc.).
- Tailwind CSS for consistent, maintainable styling with sketch-style utility patterns.

**NFR-5. UI Design & Styling**
- **Framework**: Tailwind CSS for all styling and layout
- **Design System**: Sketch/doodle aesthetic throughout
  - Hand-drawn borders and organic shapes
  - Playful, informal visual language
  - Consistent sketch-style components (buttons, inputs, cards, chat bubbles)
  - Responsive design using Tailwind breakpoints
- **Visual Consistency**: All UI elements follow the sketch-style design language
- **Performance**: Tailwind's utility-first approach ensures minimal CSS bundle size

---

## 6. Out of Scope (Future / Stretch)

- Interactive whiteboard (drawings, shapes).
- Difficulty modes by grade level.
- Advanced personalization and adaptive learning algorithms.

These can be added as v2+ once the core Socratic tutor is stable.

---

## 7. Example Problems for Testing

1. Arithmetic: `37 + 48`
2. Algebra: `2x + 5 = 13`
3. Algebra: `3(x - 2) + 4 = 19`
4. Geometry: “A rectangle has length 8 cm and width 3 cm. What is its area?”
5. Word problem: “Sam has twice as many apples as Jamie. Together they have 18 apples. How many apples does each have?”

Each of these should be solvable via Socratic dialogue without the tutor directly stating the final answer.
