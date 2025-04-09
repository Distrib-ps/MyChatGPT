/**
 * Interface for AI service providers
 * This abstraction allows easy switching between different AI providers (OpenAI, Gemini, etc.)
 */
export interface AIService {
  /**
   * Generate a response from the AI based on the conversation history
   * @param messages Array of messages with role and content
   * @returns Promise with the AI response
   */
  generateResponse(
    messages: { role: string; content: string }[],
  ): Promise<string>;
}
