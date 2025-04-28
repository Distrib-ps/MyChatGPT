import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Repository } from 'typeorm';

describe('ConversationService', () => {
  let service: ConversationService;
  let repository: Repository<Conversation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getRepositoryToken(Conversation),
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
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    repository = module.get<Repository<Conversation>>(
      getRepositoryToken(Conversation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a conversation if found', async () => {
      const conversation = {
        id: '1',
        title: 'Test Conversation',
        userId: 'user-1',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(conversation as Conversation);

      const result = await service.findById('1');

      expect(result).toEqual(conversation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['messages'],
      });
    });

    it('should return null if conversation not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByShareId', () => {
    it('should return a conversation if found', async () => {
      const conversation = {
        id: '1',
        title: 'Test Conversation',
        userId: 'user-1',
        shareId: 'share-1',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(conversation as Conversation);

      const result = await service.findByShareId('share-1');

      expect(result).toEqual(conversation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shareId: 'share-1' },
        relations: ['messages'],
      });
    });

    it('should return null if conversation not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findByShareId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return conversations for a user', async () => {
      const conversations = [
        {
          id: '1',
          title: 'Test Conversation 1',
          userId: 'user-1',
        },
        {
          id: '2',
          title: 'Test Conversation 2',
          userId: 'user-1',
        },
      ];

      jest
        .spyOn(repository, 'find')
        .mockResolvedValue(conversations as Conversation[]);

      const result = await service.findByUserId('user-1');

      expect(result).toEqual(conversations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('searchByKeyword', () => {
    it('should search conversations by keyword', async () => {
      const conversations = [
        {
          id: '1',
          title: 'Test Conversation',
          userId: 'user-1',
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(conversations),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(queryBuilder as any);

      const result = await service.searchByKeyword('user-1', 'test');

      expect(result).toEqual(conversations);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith(
        'conversation',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'conversation.userId = :userId',
        { userId: 'user-1' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'conversation.title LIKE :keyword',
        { keyword: '%test%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'conversation.updatedAt',
        'DESC',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new conversation', async () => {
      const userId = 'user-1';
      const title = 'Test Conversation';

      const newConversation = new Conversation();
      newConversation.userId = userId;
      newConversation.title = title;

      const savedConversation = {
        id: '1',
        userId,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(savedConversation as Conversation);

      const result = await service.create(userId, title);

      expect(result).toEqual(savedConversation);
    });
  });

  describe('update', () => {
    it('should update and return the conversation', async () => {
      const conversationId = '1';
      const updateData = {
        title: 'Updated Conversation',
      };

      const updatedConversation = {
        id: conversationId,
        title: 'Updated Conversation',
        userId: 'user-1',
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(service, 'findById')
        .mockResolvedValue(updatedConversation as Conversation);

      const result = await service.update(conversationId, updateData);

      expect(result).toEqual(updatedConversation);
      expect(repository.update).toHaveBeenCalledWith(
        conversationId,
        updateData,
      );
    });
  });

  describe('delete', () => {
    it('should return true if conversation was deleted', async () => {
      const conversationId = '1';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete(conversationId);

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith(conversationId);
    });

    it('should return false if conversation was not found', async () => {
      const conversationId = 'nonexistent';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      const result = await service.delete(conversationId);

      expect(result).toBe(false);
    });
  });

  describe('generateShareId', () => {
    it('should generate and save a share ID', async () => {
      const conversationId = '1';

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const shareId = await service.generateShareId(conversationId);

      expect(shareId).toBeDefined();
      expect(typeof shareId).toBe('string');
      expect(shareId.length).toBe(32); // 16 bytes in hex = 32 characters
      expect(repository.update).toHaveBeenCalledWith(conversationId, {
        shareId,
      });
    });
  });

  describe('generateShareLink', () => {
    it('should generate a share link', async () => {
      const conversationId = '1';
      const shareId = 'test-share-id';

      jest.spyOn(service, 'generateShareId').mockResolvedValue(shareId);

      const result = await service.generateShareLink(conversationId);

      expect(result).toBe(`/conversations/share/${shareId}`);
    });
  });

  describe('removeShareId', () => {
    it('should remove the share ID', async () => {
      const conversationId = '1';

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      await service.removeShareId(conversationId);

      expect(repository.update).toHaveBeenCalledWith(conversationId, {
        shareId: null,
      });
    });
  });
});
