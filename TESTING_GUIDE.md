# Phase 3 Testing Guide

## Overview

Phase 3 adds three key features:
1. **Answer Validation** - Validates student answers using OpenAI GPT-4 (LLM-as-judge)
2. **Stuck Detection** - Detects when students are stuck and need help
3. **Hint Escalation** - Provides progressively more helpful hints when stuck
4. **Output Filtering** - Prevents direct answers from being given

## New API Endpoints

### 1. `/api/validate` - Answer Validation

**Endpoint**: `POST /api/validate`

**Request Body**:
```json
{
  "studentAnswer": "x = 5",
  "problem": "Solve for x: 2x + 5 = 13",
  "expectedAnswer": "5" // Optional
}
```

**Response**:
```json
{
  "isCorrect": true,
  "feedback": "Great job! You correctly isolated x and found the solution.",
  "confidence": 0.95
}
```

### 2. Enhanced `/api/chat` - Now includes stuck detection

**Response now includes**:
```json
{
  "reply": "...",
  "conversationHistory": [...],
  "stuckInfo": {
    "isStuck": false,
    "stuckCount": 0,
    "reason": "Student is progressing normally"
  }
}
```

## Testing Scenarios

### Test 1: Answer Validation

**Test the validation endpoint directly:**

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test with a correct answer:
   ```bash
   curl -X POST http://localhost:8000/api/validate \
     -H "Content-Type: application/json" \
     -d '{
       "studentAnswer": "x = 4",
       "problem": "Solve for x: 2x + 3 = 11"
     }'
   ```

3. Test with an incorrect answer:
   ```bash
   curl -X POST http://localhost:8000/api/validate \
     -H "Content-Type: application/json" \
     -d '{
       "studentAnswer": "x = 5",
       "problem": "Solve for x: 2x + 3 = 11"
     }'
   ```

4. Test with a partial answer:
   ```bash
   curl -X POST http://localhost:8000/api/validate \
     -H "Content-Type: application/json" \
     -d '{
       "studentAnswer": "2x = 8",
       "problem": "Solve for x: 2x + 3 = 11"
     }'
   ```

**Expected Results**:
- Correct answers should return `isCorrect: true` with positive feedback
- Incorrect answers should return `isCorrect: false` with helpful feedback
- Partial answers should be evaluated appropriately

### Test 2: Stuck Detection

**Test the stuck detection in conversation:**

1. Start a conversation with a problem:
   - Problem: "Solve for x: 3x - 7 = 14"

2. Send these messages to trigger stuck detection:
   - Message 1: "I don't know"
   - Message 2: "I'm stuck"
   - Message 3: "I have no idea"

3. Check the response - it should include:
   ```json
   {
     "stuckInfo": {
       "isStuck": true,
       "stuckCount": 2,
       "reason": "Student appears stuck (2 consecutive stuck signals)"
     }
   }
   ```

4. The tutor's response should provide a concrete hint (partial step) rather than just questions

**Expected Behavior**:
- After 2+ stuck signals, tutor provides more concrete hints
- System prompt is enhanced to emphasize providing hints
- Still never gives the final answer

### Test 3: Hint Escalation

**Test progressive hint escalation:**

1. Start with problem: "Find the area of a rectangle with length 8 cm and width 3 cm"

2. Send multiple stuck signals:
   - Turn 1: "I don't know how to start"
   - Turn 2: "I'm stuck"
   - Turn 3: "I still don't understand"

3. Observe the tutor's responses:
   - Turn 1: Should ask guiding questions
   - Turn 2: Should provide a concrete hint (e.g., "Think about what formula you might use for area")
   - Turn 3: Should provide a more detailed hint (e.g., "For a rectangle, area = length × width")

**Expected Behavior**:
- Hints become progressively more concrete
- Still never reveals the final answer (24 cm²)
- Maintains encouraging tone

### Test 4: Output Filtering

**Test that direct answers are filtered:**

1. This is harder to test directly, but you can check the backend logs

2. If the AI model accidentally tries to give a direct answer, it should be filtered

3. Look for this log message in backend console:
   ```
   Direct answer detected, filtering response
   ```

4. The response should be replaced with a Socratic question instead

**Expected Behavior**:
- Direct answers are caught and filtered
- Replaced with a guiding question
- Backend logs warnings when filtering occurs

### Test 5: End-to-End Conversation

**Test a full conversation with all features:**

1. Start a problem: "Solve for x: 5x - 10 = 20"

2. Try incorrect answers:
   - "x = 5" (should get gentle feedback)

3. Try stuck signals:
   - "I don't know" (should get a hint)

4. Try correct answer:
   - "x = 6" (should be acknowledged and move forward)

**Expected Behavior**:
- Tutor never gives direct final answer
- Provides hints when stuck
- Validates answers appropriately
- Maintains conversation context

## Manual Testing Checklist

- [ ] Validation endpoint returns correct results for correct answers
- [ ] Validation endpoint returns correct results for incorrect answers
- [ ] Validation endpoint handles partial answers
- [ ] Stuck detection triggers after 2+ stuck signals
- [ ] Hint escalation provides progressively more helpful hints
- [ ] Tutor never gives direct final answers
- [ ] Output filtering catches and replaces direct answers
- [ ] Conversation maintains context throughout
- [ ] All features work with image-based problems

## Testing with Frontend

The frontend can be updated to use the validation endpoint, but it's not required for Phase 3. The validation endpoint is available for future integration.

To test with the frontend:
1. Start both frontend and backend
2. Have a conversation and observe the tutor's behavior
3. Try sending stuck signals ("I don't know", "I'm stuck")
4. Verify hints become more concrete after 2+ stuck signals

## Troubleshooting

**Validation not working:**
- Check that OpenAI API key is set correctly
- Verify the endpoint is accessible: `curl http://localhost:8000/api/validate` (should return 400, not 404)

**Stuck detection not triggering:**
- Check backend console logs for stuck detection info
- Verify you're sending 2+ consecutive messages with stuck signals
- Check the conversation history is being passed correctly

**Direct answers still appearing:**
- Check backend logs for filtering messages
- The filtering uses regex patterns - may need adjustment for edge cases
- Verify the system prompt is being used correctly

