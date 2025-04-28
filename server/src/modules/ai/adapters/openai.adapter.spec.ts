import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIAdapter } from './openai.adapter';
import { ConfigService } from '@nestjs/config';

// Créer un mock pour OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// Mock du module OpenAI
jest.mock('openai', () => {
  return {
    default: jest.fn(() => mockOpenAI),
  };
});

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;
  let configService: ConfigService;
  // Mock est utilisé indirectement via mockOpenAI

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIAdapter,
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

    adapter = module.get<OpenAIAdapter>(OpenAIAdapter);
    configService = module.get<ConfigService>(ConfigService);

    // L'instance mockée d'OpenAI est déjà disponible via mockOpenAI
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize OpenAI with the API key from config', () => {
      expect(configService.get).toHaveBeenCalledWith('OPENAI_API_KEY');
      // Vérifier que le mock a été appelé avec la bonne clé API
      expect(jest.requireMock('openai').default).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
    });
  });

  describe('generateChatCompletion', () => {
    it('should call OpenAI API and return the response content', async () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: "I'm doing well, thank you for asking!",
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await adapter.generateChatCompletion(messages);

      expect(result).toBe("I'm doing well, thank you for asking!");
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response from OpenAI', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];

      const mockResponse = {
        choices: [
          {
            message: {
              content: '',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await adapter.generateChatCompletion(messages);

      expect(result).toBe('');
    });

    it('should handle API errors', async () => {
      const messages = [{ role: 'user', content: 'Hello' }];

      // Utiliser une erreur personnalisée pour éviter le message d'erreur dans la console
      const apiError = new Error('API error');
      mockOpenAI.chat.completions.create.mockRejectedValue(apiError);

      // Capturer l'erreur directement au lieu d'utiliser .rejects.toThrow
      try {
        await adapter.generateChatCompletion(messages);
        // Si on arrive ici, c'est que l'erreur n'a pas été lancée
        fail('Expected an error to be thrown');
      } catch (error) {
        // Vérifier que l'erreur capturée est bien celle attendue
        expect(error).toBe(apiError);
        expect(error.message).toBe('API error');
      }
    });
  });
});
