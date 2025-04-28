import { Injectable } from '@nestjs/common';
import { AIService as IAIService } from '../interfaces/ai.service.interface';
import { OpenAIAdapter } from '../adapters/openai.adapter';

@Injectable()
export class AIService implements IAIService {
  constructor(private readonly openaiAdapter: OpenAIAdapter) {}

  /**
   * Generate a response from the AI based on the conversation history
   * @param messages Array of messages with role and content
   * @returns Promise with the AI response
   */
  async generateResponse(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    // If no messages are provided, add a system message
    if (messages.length === 0) {
      messages = [{ role: 'system', content: 'You are a helpful assistant.' }];
    }

    // Use the OpenAI adapter to generate a response
    return this.openaiAdapter.generateChatCompletion(messages);
  }
}
