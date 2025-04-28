import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from '../services/ai.service';
import { ConfigService } from '@nestjs/config';
import { OpenAIAdapter } from '../adapters/openai.adapter';

describe('AIService', () => {
  let service: AIService;
  let openaiAdapter: OpenAIAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: OpenAIAdapter,
          useValue: {
            generateChatCompletion: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'OPENAI_API_KEY') return 'test-api-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    openaiAdapter = module.get<OpenAIAdapter>(OpenAIAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateResponse', () => {
    it('should generate a response using the OpenAI adapter', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ];

      const expectedResponse = "I'm doing well, thank you for asking!";

      jest
        .spyOn(openaiAdapter, 'generateChatCompletion')
        .mockResolvedValue(expectedResponse);

      const result = await service.generateResponse(messages);

      expect(result).toBe(expectedResponse);
      expect(openaiAdapter.generateChatCompletion).toHaveBeenCalledWith(
        messages,
      );
    });

    it('should handle empty messages array', async () => {
      const messages = [];

      const expectedResponse = "I'm an AI assistant. How can I help you today?";

      jest
        .spyOn(openaiAdapter, 'generateChatCompletion')
        .mockResolvedValue(expectedResponse);

      const result = await service.generateResponse(messages);

      expect(result).toBe(expectedResponse);
      expect(openaiAdapter.generateChatCompletion).toHaveBeenCalledWith([
        { role: 'system', content: 'You are a helpful assistant.' },
      ]);
    });

    it('should handle errors from the OpenAI adapter', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];

      jest
        .spyOn(openaiAdapter, 'generateChatCompletion')
        .mockRejectedValue(new Error('API error'));

      await expect(service.generateResponse(messages)).rejects.toThrow(
        'API error',
      );
    });
  });
});
