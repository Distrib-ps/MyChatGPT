import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIAdapter {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate a chat completion using OpenAI API
   * @param messages Array of messages with role and content
   * @returns Promise with the AI response
   */
  async generateChatCompletion(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    try {
      // Convertir les messages au format attendu par l'API OpenAI
      const formattedMessages = messages.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      // En environnement de production, on journalise l'erreur
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error calling OpenAI API:', error);
      }
      throw error;
    }
  }

  /**
   * Generate a response from the AI based on the conversation history
   * Implements the AIService interface
   * @param messages Array of messages with role and content
   * @returns Promise with the AI response
   */
  async generateResponse(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    return this.generateChatCompletion(messages);
  }
}
