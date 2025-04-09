import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIService } from '../../interfaces/ai.service.interface';
import axios from 'axios';

@Injectable()
export class OpenAIAdapter implements AIService {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {}

  async generateResponse(messages: { role: string; content: string }[]): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: messages.map((message) => ({
            role: message.role.toLowerCase(),
            content: message.content,
          })),
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error.response?.data || error.message);
      throw new Error('Failed to generate AI response');
    }
  }
}
