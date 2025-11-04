# Product Context: AI Math Tutor

## Why This Project Exists

Traditional math tutoring often provides direct answers, which doesn't help students develop problem-solving skills. This project creates a **Socratic learning assistant** that guides students to discover solutions themselves through strategic questioning.

## Problems It Solves

1. **Passive Learning**: Students often get direct answers without understanding the reasoning
2. **Lack of Adaptability**: Traditional resources don't adjust to individual student understanding
3. **Accessibility**: Students need 24/7 access to tutoring support, not limited to scheduled sessions
4. **Multi-format Input**: Students work with both typed problems and printed homework/textbook screenshots
5. **Context Loss**: Students struggle when they can't maintain conversation context across problem-solving steps

## How It Should Work

### Core Experience Flow

1. **Problem Input**
   - Student types a problem OR uploads a screenshot
   - System extracts/confirms the problem text
   - Original problem is displayed at top of conversation

2. **Socratic Dialogue**
   - Tutor begins with a question, not an answer
   - Each response includes:
     - Brief reflection (1-2 sentences max)
     - Follow-up questions that move the student forward
   - Tutor acknowledges correct answers and moves to next step
   - Tutor provides gentle feedback and simpler questions for incorrect answers

3. **Adaptive Support**
   - If student is stuck for 2+ consecutive turns, tutor provides concrete hints
   - Hints are partial steps, not full solutions
   - Tutor never reveals final numeric/algebraic answers
   - Scaffolding adapts based on student responses (smaller chunks for struggling students)

4. **Solution Completion**
   - Student discovers solution through guided questioning
   - Tutor validates intermediate and final answers
   - Conversation maintains context throughout entire problem-solving process

## User Experience Goals

- **Patient and Encouraging**: Tutor uses supportive language, never frustrated
- **Clear and Structured**: Math expressions rendered beautifully with LaTeX
- **Playful and Approachable**: Sketch/doodle style UI with handwritten fonts (Kalam/Caveat) creates friendly, informal learning environment
- **Responsive**: LLM responses within 3-5 seconds, clear loading states
- **Reliable**: Graceful degradation if OCR fails or LLM times out
- **Contextual**: Conversation history preserved throughout problem-solving session
- **Visually Engaging**: Hand-drawn aesthetic makes the interface less intimidating for students

## Key Use Cases

1. **Text Problem Input**: Student types "2x + 5 = 13", tutor guides through solving
2. **Screenshot Input**: Student uploads homework screenshot, OCR extracts problem, tutor confirms and guides
3. **Multi-step Algebra**: Student inputs "3(x - 2) + 4 = 19", tutor guides through distribution, simplification, isolation, checking
4. **Geometry Problem**: Student inputs area/volume word problem, tutor helps identify formulas and compute
5. **Word Problem**: Student inputs story-based problem, tutor helps translate to equations and solve

