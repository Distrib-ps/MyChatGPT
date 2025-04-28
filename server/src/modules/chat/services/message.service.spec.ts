import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message, MessageRole } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { AIService } from '../../ai/interfaces/ai.service.interface';

describe('MessageService', () => {
  let service: MessageService;
  let repository: Repository<Message>;
  let aiService: AIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
        {
          provide: 'AIService',
          useValue: {
            generateResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get<Repository<Message>>(getRepositoryToken(Message));
    aiService = module.get('AIService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a message if found', async () => {
      const message = {
        id: '1',
        content: 'Test message',
        role: MessageRole.USER,
        conversationId: 'conv-1',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(message as Message);

      const result = await service.findById('1');

      expect(result).toEqual(message);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if message not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByConversationId', () => {
    it('should return messages for a conversation', async () => {
      const messages = [
        {
          id: '1',
          content: 'Test message 1',
          role: MessageRole.USER,
          conversationId: 'conv-1',
        },
        {
          id: '2',
          content: 'Test message 2',
          role: MessageRole.ASSISTANT,
          conversationId: 'conv-1',
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(messages as Message[]);

      const result = await service.findByConversationId('conv-1');

      expect(result).toEqual(messages);
      expect(repository.find).toHaveBeenCalledWith({
        where: { conversationId: 'conv-1' },
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('searchInConversation', () => {
    it('should search messages by keyword in a conversation', async () => {
      const messages = [
        {
          id: '1',
          content: 'Test message with keyword',
          role: MessageRole.USER,
          conversationId: 'conv-1',
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(messages),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);

      const result = await service.searchInConversation('conv-1', 'keyword');

      expect(result).toEqual(messages);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('message');
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'message.conversationId = :conversationId',
        { conversationId: 'conv-1' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'message.content LIKE :keyword',
        { keyword: '%keyword%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'message.createdAt',
        'ASC',
      );
    });
  });

  describe('createUserMessage', () => {
    it('should create and return a new user message', async () => {
      const conversationId = 'conv-1';
      const content = 'Test user message';

      const newMessage = new Message();
      newMessage.conversationId = conversationId;
      newMessage.content = content;
      newMessage.role = MessageRole.USER;

      const savedMessage = {
        id: '1',
        conversationId,
        content,
        role: MessageRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'create').mockReturnValue(newMessage);
      jest.spyOn(repository, 'save').mockResolvedValue(savedMessage as Message);

      const result = await service.createUserMessage(conversationId, content);

      expect(result).toEqual(savedMessage);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(newMessage);
    });
  });

  describe('createAssistantMessage', () => {
    it('should create and return a new assistant message with AI-generated content', async () => {
      const conversationId = 'conv-1';
      const userMessages = [
        {
          id: '1',
          content: 'User message 1',
          role: MessageRole.USER,
          conversationId,
        },
        {
          id: '2',
          content: 'Assistant message 1',
          role: MessageRole.ASSISTANT,
          conversationId,
        },
        {
          id: '3',
          content: 'User message 2',
          role: MessageRole.USER,
          conversationId,
        },
      ];

      const aiResponse = 'AI-generated response';

      const newMessage = new Message();
      newMessage.conversationId = conversationId;
      newMessage.content = aiResponse;
      newMessage.role = MessageRole.ASSISTANT;

      const savedMessage = {
        id: '4',
        conversationId,
        content: aiResponse,
        role: MessageRole.ASSISTANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'findByConversationId')
        .mockResolvedValue(userMessages as Message[]);
      jest.spyOn(aiService, 'generateResponse').mockResolvedValue(aiResponse);
      jest.spyOn(repository, 'create').mockReturnValue(newMessage);
      jest.spyOn(repository, 'save').mockResolvedValue(savedMessage as Message);

      const result = await service.createAssistantMessage(conversationId);

      expect(result).toEqual(savedMessage);
      expect(service.findByConversationId).toHaveBeenCalledWith(conversationId);
      expect(aiService.generateResponse).toHaveBeenCalledWith([
        { role: 'user', content: 'User message 1' },
        { role: 'assistant', content: 'Assistant message 1' },
        { role: 'user', content: 'User message 2' },
      ]);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(newMessage);
    });
  });

  describe('update', () => {
    it('should update and return the message', async () => {
      const messageId = '1';
      const updateData = {
        content: 'Updated message',
      };

      const updatedMessage = {
        id: messageId,
        content: 'Updated message',
        role: MessageRole.USER,
        conversationId: 'conv-1',
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(updatedMessage as Message);

      const result = await service.update(messageId, updateData);

      expect(result).toEqual(updatedMessage);
      expect(repository.update).toHaveBeenCalledWith(messageId, updateData);
    });

    it('should return null if message not found', async () => {
      const messageId = 'nonexistent';
      const updateData = {
        content: 'Updated message',
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      const result = await service.update(messageId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call repository.delete with the message id', async () => {
      const messageId = '1';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.delete(messageId);

      expect(repository.delete).toHaveBeenCalledWith(messageId);
    });

    it('should handle case when message was not found', async () => {
      const messageId = 'nonexistent';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      // La méthode ne retourne rien (void), donc on vérifie juste qu'elle s'exécute sans erreur
      await expect(service.delete(messageId)).resolves.not.toThrow();
    });
  });
});
