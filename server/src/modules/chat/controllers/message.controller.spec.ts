import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../services/message.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            findByConversationId: jest.fn(),
            searchInConversation: jest.fn(),
            createUserMessage: jest.fn(),
            createAssistantMessage: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByConversationId', () => {
    it('should return all messages for a conversation', async () => {
      const conversationId = 'conv-1';
      const messages = [
        { id: '1', content: 'Message 1', conversationId },
        { id: '2', content: 'Message 2', conversationId },
      ];

      jest
        .spyOn(service, 'findByConversationId')
        .mockResolvedValue(messages as any);

      const result = await controller.findByConversationId(conversationId);

      expect(result).toBe(messages);
      expect(service.findByConversationId).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('searchInConversation', () => {
    it('should search messages by keyword in a conversation', async () => {
      const conversationId = 'conv-1';
      const keyword = 'test';
      const messages = [{ id: '1', content: 'Test message', conversationId }];

      jest
        .spyOn(service, 'searchInConversation')
        .mockResolvedValue(messages as any);

      const result = await controller.searchInConversation(
        conversationId,
        keyword,
      );

      expect(result).toBe(messages);
      expect(service.searchInConversation).toHaveBeenCalledWith(
        conversationId,
        keyword,
      );
    });
  });

  describe('createUserMessage', () => {
    it('should create a new user message', async () => {
      const conversationId = 'conv-1';
      const createDto: CreateMessageDto = {
        content: 'New user message',
      };

      const newMessage = {
        id: '1',
        content: 'New user message',
        conversationId,
        role: 'USER',
      };

      jest
        .spyOn(service, 'createUserMessage')
        .mockResolvedValue(newMessage as any);

      const result = await controller.createUserMessage(
        conversationId,
        createDto,
      );

      expect(result).toBe(newMessage);
      expect(service.createUserMessage).toHaveBeenCalledWith(
        conversationId,
        createDto.content,
      );
    });
  });

  describe('createAssistantMessage', () => {
    it('should create a new assistant message', async () => {
      const conversationId = 'conv-1';

      const newMessage = {
        id: '1',
        content: 'AI-generated response',
        conversationId,
        role: 'ASSISTANT',
      };

      jest
        .spyOn(service, 'createAssistantMessage')
        .mockResolvedValue(newMessage as any);

      const result = await controller.createAssistantMessage(conversationId);

      expect(result).toBe(newMessage);
      expect(service.createAssistantMessage).toHaveBeenCalledWith(
        conversationId,
      );
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = '1';
      const updateDto: UpdateMessageDto = {
        content: 'Updated message',
      };

      const updatedMessage = {
        id: messageId,
        content: 'Updated message',
        conversationId: 'conv-1',
        role: 'USER',
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedMessage as any);

      const result = await controller.update(messageId, updateDto);

      expect(result).toBe(updatedMessage);
      expect(service.update).toHaveBeenCalledWith(messageId, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a message and return success status', async () => {
      const messageId = '1';

      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.remove(messageId);

      expect(result).toEqual({ success: true });
      expect(service.delete).toHaveBeenCalledWith(messageId);
    });
  });
});
