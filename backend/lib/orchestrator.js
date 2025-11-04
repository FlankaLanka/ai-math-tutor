import { getOpenAIClient } from './openai.js';
import { detectStuck } from './validation.js';

/**
 * Socratic tutor system prompt
 * Enforces no direct answers, only questions and hints
 */
const SYSTEM_PROMPT = `You are a patient and encouraging math tutor. Your role is to guide students through solving math problems using the Socratic method.

CRITICAL RULES (MUST FOLLOW):
1. NEVER give direct final answers - always use questions to guide the student
2. NEVER reveal the numeric or algebraic final answer, even if student asks repeatedly
3. If the student is stuck for 2+ consecutive turns, provide a concrete hint (partial step, not full solution)
4. Use encouraging, supportive language
5. Break down complex problems into smaller steps
6. Ask questions that help students discover the solution themselves
7. When a student answers correctly, acknowledge and move to the next step
8. When a student answers incorrectly, give gentle feedback and ask a simpler question
9. When a student shares an image (graph, diagram, work, etc.), you CAN see it and should reference specific details from the image in your guidance
10. For graph problems, help students identify key features like intercepts, shape, end behavior, and relate them to function properties
11. For multiple-choice questions with graphs, guide students to analyze the graph characteristics and match them to the function options

VALIDATION AND CORRECTION RULES (CRITICAL - MUST FOLLOW):
12. NEVER affirm a student answer without first verifying it against the actual problem statement, image, diagram, or given information
13. When a student provides an answer, ALWAYS check it against what you can see in the problem/image/data before responding
14. If you cannot verify an answer is correct, DO NOT affirm it - instead ask them to verify, recalculate, or look more carefully
15. For problems with images/diagrams: You CAN see the image - carefully verify all details (coordinates, measurements, labels, etc.) before confirming any answer
16. If a student gives an answer that doesn't match what you can verify, DO NOT say "Great!" or "Yes!" - instead guide them to check their work or reconsider
17. Use phrases like "Let's verify that together" or "Can you walk me through how you got that?" instead of immediately confirming
18. If a student gives an incorrect answer, respond with: "Let's check that step by step" or "Can you double-check your work?" - NEVER affirm incorrect answers
19. Only use affirmative language ("Yes!", "Great!", "Perfect!") when you have verified the answer is ACTUALLY correct by checking the problem/image/calculations
20. When in doubt about an answer's correctness, default to asking the student to verify, explain their reasoning, or recalculate rather than affirming

HINT ESCALATION STRATEGY:
- After 2+ stuck signals: Provide a concrete partial step (e.g., "Try isolating x on one side" not "x = 5")
- After 3+ stuck signals: Give a more detailed hint but still partial (e.g., "Start by subtracting 5 from both sides")
- NEVER escalate to giving the full solution or final answer

ANSWER VALIDATION STRATEGY (STRICT PROTOCOL):
- STEP 1: Student provides an answer
- STEP 2: Check the answer against the actual problem statement, image, diagram, or given data you can see
- STEP 3A: If answer is CORRECT and VERIFIED: Acknowledge and move forward
- STEP 3B: If answer is INCORRECT or UNVERIFIED: Do NOT affirm - guide them to verify (e.g., "Let's check that step by step" or "Can you verify your calculation?")
- STEP 3C: If you're UNSURE: Ask them to verify, explain their reasoning, or recalculate rather than affirming
- CRITICAL: Never use affirmative language ("Yes!", "Great!", "Perfect!") unless you have verified the answer is correct
- For all problem types: Verify answers against the actual problem data, don't just accept what the student says

Remember: Your goal is to help students learn by discovering, not by giving answers. When images are shared, use the visual information to provide more targeted guidance.`;

/**
 * Filter out direct answers from tutor responses
 * @param {string} reply - The tutor's reply
 * @param {string} problem - The problem being solved
 * @returns {string} - Filtered reply without direct answers
 */
function filterDirectAnswers(reply, problem) {
  // Only filter if the reply is very short (just a number/answer) or explicitly states final answer
  // Be more lenient to allow acknowledgments and guidance
  
  // Check for explicit final answer statements (strong signals)
  const explicitFinalAnswerPatterns = [
    /^the (final )?answer is\s+[0-9.\-+\/x=y]+[\.!]?$/i, // "The answer is 5" or "The final answer is x=3"
    /^the solution is\s+[0-9.\-+\/x=y]+[\.!]?$/i, // "The solution is 42"
    /^it'?s\s+[0-9.\-+\/x=y]+[\.!]?$/i, // "It's 5" or "It is x=3"
    /^so the answer is\s+[0-9.\-+\/x=y]+[\.!]?$/i, // "So the answer is 10"
    /^therefore,?\s+(the answer|it) is\s+[0-9.\-+\/x=y]+[\.!]?$/i, // "Therefore, the answer is 5"
  ];
  
  // Check for very short responses that are just numbers (likely direct answer)
  const isJustNumber = /^[0-9.\-+\/]+[\.!]?$/i.test(reply.trim());
  
  // Check for "x = number" at the very end with no context (likely direct answer)
  const endsWithDirectAnswer = /(?:^|\.)\s*x\s*=\s*[0-9.\-+\/]+\s*[\.!]?\s*$/i.test(reply.trim());
  
  // Only filter if it's a very clear direct answer
  // Don't filter if it's part of a longer explanation or guidance
  for (const pattern of explicitFinalAnswerPatterns) {
    if (pattern.test(reply.trim())) {
      console.warn('Direct answer detected, filtering response:', reply.substring(0, 50));
      return "I see you're trying to find the answer! Let's work through this step by step. Can you tell me what your next step would be?";
    }
  }
  
  // Only filter standalone numbers if they're the entire response (very short)
  if (isJustNumber && reply.trim().length < 20) {
    console.warn('Direct answer (number only) detected, filtering response:', reply);
    return "I see you're trying to find the answer! Let's work through this step by step. Can you tell me what your next step would be?";
  }
  
  // Only filter ending with "x = number" if it's a very short response
  if (endsWithDirectAnswer && reply.trim().length < 30) {
    console.warn('Direct answer (x = number) detected, filtering response:', reply);
    return "I see you're trying to find the answer! Let's work through this step by step. Can you tell me what your next step would be?";
  }
  
  return reply;
}

/**
 * Create an orchestrator instance for managing Socratic dialogue
 */
export function createOrchestrator(problem, conversationHistory = []) {
  return {
    /**
     * Generate a Socratic response to the student's message
     * @param {string} userMessage - The user's message
     * @param {string} image - Optional base64 image data URL
     */
    async generateResponse(userMessage, image = null) {
      const openai = getOpenAIClient();
      
      // Detect if student is stuck
      const stuckInfo = detectStuck(conversationHistory);
      
      // Build enhanced system prompt based on stuck status
      let enhancedSystemPrompt = SYSTEM_PROMPT;
      if (stuckInfo.isStuck) {
        enhancedSystemPrompt += `\n\nIMPORTANT: The student appears to be stuck (${stuckInfo.stuckCount} consecutive stuck signals). You should provide a concrete hint (partial step) to help them make progress. However, still NEVER give the final answer.`;
      }
      
      // Build message history
      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        { 
          role: 'system', 
          content: `The math problem we're working on is: ${problem}` 
        }
      ];

      // Check if there's a reference image in conversation history
      // We'll need to include it in the conversation for context
      let referenceImageFromHistory = null;
      for (const msg of conversationHistory) {
        if (msg.role === 'user' && typeof msg.content === 'object' && msg.content?.image) {
          referenceImageFromHistory = msg.content.image;
          break;
        }
      }

      // Add conversation history (convert stored format to API format)
      // Include images from history so AI maintains visual context
      conversationHistory.forEach(msg => {
        if (msg.role === 'user' && typeof msg.content === 'object' && msg.content.image) {
          // Include image with user message from history
          const content = [
            { type: 'text', text: msg.content.text || 'I shared an image with this message.' },
            { type: 'image_url', image_url: { url: msg.content.image } }
          ];
          messages.push({ role: 'user', content });
        } else {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
      
      // If there's a reference image but it's not in the current message and not in history yet,
      // prepend it as a user message so AI has visual context
      // This handles the case where the image exists but conversation history is empty
      if (referenceImageFromHistory && 
          (!image || image !== referenceImageFromHistory) &&
          conversationHistory.length === 0) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: 'Reference image of the problem (always visible for context - includes graphs, diagrams, equations, etc.):' },
            { type: 'image_url', image_url: { url: referenceImageFromHistory } }
          ]
        });
      }

      // Add current user message with optional image
      // Only include image if it's a NEW image (not the reference image)
      if (image && image !== referenceImageFromHistory) {
        // New image attached by user
        const textPrompt = userMessage || 'I need help with this image.';
        const userContent = [
          { type: 'text', text: textPrompt },
          { type: 'image_url', image_url: { url: image } }
        ];
        messages.push({ role: 'user', content: userContent });
      } else {
        // Regular text message (reference image already in system context)
        messages.push({ role: 'user', content: userMessage || '' });
      }

      try {
        // Use gpt-4o if there's ANY image (reference or new), otherwise use gpt-4
        const hasAnyImage = image || referenceImageFromHistory;
        const model = hasAnyImage ? 'gpt-4o' : 'gpt-4';
        
        const response = await openai.chat.completions.create({
          model: model,
          messages,
          temperature: 0.7,
          max_tokens: 500
        });

        let reply = response.choices[0].message.content;
        
        // Output filtering: Check if response violates "no direct answers" rule
        reply = filterDirectAnswers(reply, problem);
        
        // Update conversation history - store image if present
        const userHistoryContent = image 
          ? { type: 'mixed', text: userMessage || '', image: image }
          : userMessage || '';
        
        const updatedHistory = [
          ...conversationHistory,
          { role: 'user', content: userHistoryContent },
          { role: 'assistant', content: reply }
        ];

        return { 
          reply, 
          updatedHistory,
          stuckInfo // Include stuck detection info for frontend
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error(`Failed to generate response: ${error.message}`);
      }
    },

    /**
     * Get the current problem
     */
    getProblem() {
      return problem;
    }
  };
}

