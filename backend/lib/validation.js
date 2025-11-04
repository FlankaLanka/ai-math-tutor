import { getOpenAIClient } from './openai.js';

/**
 * Validate a student's answer using OpenAI GPT-4 as a judge
 * @param {string} studentAnswer - The student's answer
 * @param {string} problem - The original problem
 * @param {string} expectedAnswer - Optional expected answer (if known)
 * @returns {Promise<{isCorrect: boolean, feedback: string, confidence: number}>}
 */
export async function validateAnswer(studentAnswer, problem, expectedAnswer = null) {
  const openai = getOpenAIClient();
  
  const validationPrompt = `You are a math tutor validating a student's answer. Determine if the student's answer is correct.

Problem: ${problem}
Student's Answer: ${studentAnswer}
${expectedAnswer ? `Expected Answer: ${expectedAnswer}` : 'No expected answer provided - evaluate based on the problem statement.'}

Evaluate the student's answer carefully:
- For numeric answers, allow for small rounding differences and alternative formats (e.g., "2.5" vs "5/2" vs "2 1/2")
- For algebraic answers, check if the expressions are equivalent
- Consider if the answer is partially correct or on the right track
- Be encouraging but accurate

Respond in JSON format:
{
  "isCorrect": true/false,
  "feedback": "Brief, encouraging feedback explaining why it's correct or what's wrong",
  "confidence": 0.0-1.0 (how confident you are in the validation)
}`;

  try {
    // Try with JSON mode first (if supported), fallback to regular parsing
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a math tutor validating student answers. Always respond in valid JSON format with this exact structure: {"isCorrect": true/false, "feedback": "string", "confidence": 0.0-1.0}'
        },
        {
          role: 'user',
          content: validationPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent validation
      max_tokens: 300
    });

    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from response
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse validation response as JSON');
      }
    }
    
    return {
      isCorrect: result.isCorrect || false,
      feedback: result.feedback || 'Answer received.',
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error('Validation error:', error);
    // Fallback: return neutral validation
    return {
      isCorrect: false,
      feedback: 'Unable to validate answer. Please try again.',
      confidence: 0.0
    };
  }
}

/**
 * Detect if student is stuck based on conversation history
 * @param {Array} conversationHistory - Array of conversation messages
 * @returns {Object} {isStuck: boolean, stuckCount: number, reason: string}
 */
export function detectStuck(conversationHistory) {
  const recentMessages = conversationHistory.slice(-6); // Last 6 messages (3 exchanges)
  let stuckCount = 0;
  let lastUserMessage = null;
  
  // Look for patterns indicating student is stuck
  const stuckPatterns = [
    /i don'?t know/i,
    /i have no idea/i,
    /i'm stuck/i,
    /i can'?t do this/i,
    /i don'?t understand/i,
    /help me/i,
    /just tell me/i,
    /what's the answer/i,
    /i give up/i
  ];
  
  // Count consecutive incorrect or stuck responses
  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    
    if (msg.role === 'user') {
      lastUserMessage = msg.content;
      const content = typeof msg.content === 'object' ? msg.content.text || '' : msg.content;
      
      // Check for explicit stuck signals
      if (stuckPatterns.some(pattern => pattern.test(content))) {
        stuckCount++;
      } else {
        // If we hit a non-stuck message, break
        break;
      }
    } else if (msg.role === 'assistant') {
      // Check if assistant gave a hint (indicates student was stuck)
      const hintKeywords = ['hint', 'try', 'think about', 'consider', 'remember'];
      const content = msg.content || '';
      if (hintKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
        // This might indicate previous stuck state, but don't count it
        continue;
      }
    }
  }
  
  const isStuck = stuckCount >= 2;
  
  return {
    isStuck,
    stuckCount,
    reason: isStuck 
      ? `Student appears stuck (${stuckCount} consecutive stuck signals)`
      : 'Student is progressing normally'
  };
}

