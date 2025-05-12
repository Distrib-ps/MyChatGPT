import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from '../services/conversation.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';

describe('ConversationController', () => {
  let controller: ConversationController;
  let service: ConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: {
            findByUserId: jest.fn(),
            searchByKeyword: jest.fn(),
            findById: jest.fn(),
            findByShareId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            generateShareId: jest.fn(),
            removeShareId: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConversationController>(ConversationController);
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all conversations for a user', async () => {
      const userId = 'user-1';
      const conversations = [
        { id: '1', title: 'Conversation 1', userId },
        { id: '2', title: 'Conversation 2', userId },
      ];

      jest
        .spyOn(service, 'findByUserId')
        .mockResolvedValue(conversations as any);

      const req = { user: { id: userId } } as unknown as Request;
      const result = await controller.findAll(req);

      expect(result).toBe(conversations);
      expect(service.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('search', () => {
    it('should search conversations by keyword', async () => {
      const userId = 'user-1';
      const keyword = 'test';
      const conversations = [{ id: '1', title: 'Test Conversation', userId }];

      jest
        .spyOn(service, 'searchByKeyword')
        .mockResolvedValue(conversations as any);

      const req = { user: { id: userId } } as unknown as Request;
      const result = await controller.search(req, keyword);

      expect(result).toBe(conversations);
      expect(service.searchByKeyword).toHaveBeenCalledWith(userId, keyword);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by id', async () => {
      const conversationId = '1';
      const conversation = {
        id: conversationId,
        title: 'Test Conversation',
        userId: 'user-1',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(conversation as any);

      const result = await controller.findOne(conversationId);

      expect(result).toBe(conversation);
      expect(service.findById).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('findByShareId', () => {
    it('should return a conversation by share id', async () => {
      const shareId = 'share-1';
      const conversation = {
        id: '1',
        title: 'Test Conversation',
        userId: 'user-1',
        shareId,
      };

      jest
        .spyOn(service, 'findByShareId')
        .mockResolvedValue(conversation as any);

      const result = await controller.findByShareId(shareId);

      expect(result).toBe(conversation);
      expect(service.findByShareId).toHaveBeenCalledWith(shareId);
    });
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const userId = 'user-1';
      const createDto: CreateConversationDto = {
        title: 'New Conversation',
      };

      const newConversation = {
        id: '1',
        title: 'New Conversation',
        userId,
      };

      jest.spyOn(service, 'create').mockResolvedValue(newConversation as any);

      const req = { user: { id: userId } } as unknown as Request;
      const result = await controller.create(req, createDto);

      expect(result).toBe(newConversation);
      expect(service.create).toHaveBeenCalledWith(userId, createDto.title);
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const conversationId = '1';
      const updateDto: UpdateConversationDto = {
        title: 'Updated Conversation',
      };

      const updatedConversation = {
        id: conversationId,
        title: 'Updated Conversation',
        userId: 'user-1',
      };

      jest
        .spyOn(service, 'update')
        .mockResolvedValue(updatedConversation as any);

      const result = await controller.update(conversationId, updateDto);

      expect(result).toBe(updatedConversation);
      expect(service.update).toHaveBeenCalledWith(conversationId, updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a conversation and return success status', async () => {
      const conversationId = '1';
      const userId = 'user-1';

      // Mock findById pour simuler qu'une conversation existe
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: conversationId,
        userId: userId,
        title: 'Test Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      } as any);

      jest.spyOn(service, 'delete').mockResolvedValue(true);

      // Créer un objet Request mock avec un utilisateur
      const mockRequest = {
        user: { id: 'user-1' },
        // Ajouter les propriétés minimales nécessaires pour satisfaire le type Request
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
        acceptsEncodings: jest.fn(),
        acceptsLanguages: jest.fn(),
        param: jest.fn(),
        is: jest.fn(),
        app: {},
        baseUrl: '',
        body: {},
        cookies: {},
        fresh: false,
        hostname: '',
        ip: '',
        ips: [],
        method: 'DELETE',
        originalUrl: '',
        params: {},
        path: '',
        protocol: '',
        query: {},
        route: {},
        secure: false,
        signedCookies: {},
        stale: true,
        subdomains: [],
        xhr: false,
      } as unknown as Request;

      const result = await controller.delete(conversationId, mockRequest);

      expect(result).toEqual({ success: true });
      expect(service.delete).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('generateShareId', () => {
    it('should generate a share id for a conversation', async () => {
      const conversationId = '1';
      const shareId = 'share-1';

      jest.spyOn(service, 'generateShareId').mockResolvedValue(shareId);

      const result = await controller.generateShareId(conversationId);

      expect(result).toEqual({ shareId });
      expect(service.generateShareId).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('removeShareId', () => {
    it('should remove the share id from a conversation', async () => {
      const conversationId = '1';

      jest.spyOn(service, 'removeShareId').mockResolvedValue();

      await controller.removeShareId(conversationId);

      expect(service.removeShareId).toHaveBeenCalledWith(conversationId);
    });
  });
});
