# Project Brief: AI Math Tutor – Socratic Learning Assistant

## Core Mission

Build a web-based AI math tutor that guides students through problems using **Socratic questioning** rather than direct answers. The system helps students discover solutions step-by-step through guided questioning, adapting to their understanding level.

## Key Requirements

### Primary Goals
- Guide students through math problems using **Socratic method** (questions, not answers)
- Support **5+ math problem types**:
  - Simple arithmetic
  - Linear equations / basic algebra
  - Basic geometry
  - Word problems
  - Multi-step problems
- Accept **both text and image input** (screenshots of printed problems)
- Maintain **conversation context** across multiple turns
- Adapt scaffolding and hints based on student responses

### Critical Constraints
- **NEVER give direct final answers** - always use questions and hints
- Tutor must maintain character across **10+ turns** for a single problem
- Handle image-based problems with **80%+ accuracy** for clean screenshots
- Support at least **one full solution path** in each problem category

### Success Criteria
- Handles at least **5 example problems** end-to-end without breaking character
- Conversations remain coherent over **10+ turns** for a single problem
- Students can complete full solution paths in each problem category
- Correctly parses image-based problems for at least **80%** of clean screenshots

## Timeline

**Core development: Single day build** (5 phases)
- Phase 1: Project setup & basic chat flow
- Phase 2: Image upload & OCR
- Phase 3: Socratic orchestrator & validation
- Phase 4: UI polish & math rendering
- Phase 5: Persistence & polish

## Technology Stack

**AI Services - OpenAI API exclusively**:
- **GPT-4** for Socratic dialogue and tutoring
- **GPT-4 Vision** for image/OCR extraction
- **GPT-4** for answer validation (LLM-as-judge approach)

## Out of Scope (v1)

- Interactive whiteboard
- Step animation visualizations
- Voice input/output
- Animated avatar
- Difficulty modes by grade level
- Problem generation / practice sets

These features are planned for v2+ once the core Socratic tutor is stable.

## Target User

**Primary user**: Middle to early high school student (Grade 6–10 equivalent) struggling with math homework. Has basic familiarity with typing, uploading images, and web apps.

