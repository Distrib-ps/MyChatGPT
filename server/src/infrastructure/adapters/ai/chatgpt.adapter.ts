import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message, MessageRole } from '../../../domains/chat/entities/message.entity';
import axios from 'axios';

export interface IAIAdapter {
  generateResponse(messages: Message[]): Promise<string>;
}

@Injectable()
export class ChatGPTAdapter implements IAIAdapter {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {}

  async generateResponse(messages: Message[]): Promise<string> {
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
            role: message.role === MessageRole.USER ? 'user' : 'assistant',
            content: message.content,
          })),
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error.response?.data || error.message);
      throw new Error('Failed to generate response from ChatGPT');
    }
  }
}
