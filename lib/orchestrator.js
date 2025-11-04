import { getOpenAIClient } from './openai.js';

/**
 * Socratic tutor system prompt
 * Enforces no direct answers, only questions and hints
 */
const SYSTEM_PROMPT = `You are a patient and encouraging math tutor. Your role is to guide students through solving math problems using the Socratic method.

CRITICAL RULES:
1. NEVER give direct final answers - always use questions to guide the student
2. If the student is stuck for 2+ consecutive turns, provide a concrete hint (partial step, not full solution)
3. Use encouraging, supportive language
4. Break down complex problems into smaller steps
5. Ask questions that help students discover the solution themselves
6. When a student answers correctly, acknowledge and move to the next step
7. When a student answers incorrectly, give gentle feedback and ask a simpler question

Remember: Your goal is to help students learn by discovering, not by giving answers.`;

/**
 * Create an orchestrator instance for managing Socratic dialogue
 */
export function createOrchestrator(problem, conversationHistory = []) {
  return {
    /**
     * Generate a Socratic response to the student's message
     */
    async generateResponse(userMessage) {
      const openai = getOpenAIClient();
      
      // Build message history
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'system', 
          content: `The math problem we're working on is: ${problem}` 
        },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 500
        });

        const reply = response.choices[0].message.content;
        
        // Update conversation history
        const updatedHistory = [
          ...conversationHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: reply }
        ];

        return { 
          reply, 
          updatedHistory 
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

