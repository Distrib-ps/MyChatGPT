import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/user/entities/user.entity';
import { Conversation } from '../src/modules/chat/entities/conversation.entity';
import { Message } from '../src/modules/chat/entities/message.entity';
// Import AIService from the correct path
import { AIService } from '../src/modules/ai/services/ai.service';

describe('MessageController (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: any; // Used for user creation
  let conversationRepository;
  let messageRepository;
  let jwtToken: string;
  let userId: string;
  let conversationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AIService)
      .useValue({
        generateResponse: jest
          .fn()
          .mockResolvedValue('This is a mock AI response'),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    conversationRepository = moduleFixture.get(
      getRepositoryToken(Conversation),
    );
    messageRepository = moduleFixture.get(getRepositoryToken(Message));

    // Create a user and get JWT token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'messageuser',
        email: 'message@example.com',
        password: 'password123',
      });

    jwtToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;

    // Create a conversation for the user
    const conversation = await conversationRepository.save({
      title: 'Test Conversation',
      userId,
    });
    conversationId = conversation.id;
  });

  beforeEach(async () => {
    // Clear messages before each test
    await messageRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/conversations/:conversationId/messages (POST)', () => {
    it('should create a new user message', async () => {
      const response = await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Hello, this is a test message',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('Hello, this is a test message');
      expect(response.body.conversationId).toBe(conversationId);
      expect(response.body.role).toBe('USER');

      // Verify the message was created in the database
      const message = await messageRepository.findOne({
        where: { id: response.body.id },
      });
      expect(message).toBeDefined();
      expect(message.content).toBe('Hello, this is a test message');
      expect(message.conversationId).toBe(conversationId);
      expect(message.role).toBe('USER');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/messages`)
        .send({
          content: 'Hello, this is a test message',
        })
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .post('/conversations/nonexistent-id/messages')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Hello, this is a test message',
        })
        .expect(404);
    });
  });

  describe('/conversations/:conversationId/messages/ai (POST)', () => {
    beforeEach(async () => {
      // Create a user message first
      await messageRepository.save({
        content: 'Hello AI, can you help me?',
        conversationId,
        role: 'USER',
      });
    });

    it('should create a new AI message', async () => {
      const response = await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/messages/ai`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('This is a mock AI response');
      expect(response.body.conversationId).toBe(conversationId);
      expect(response.body.role).toBe('ASSISTANT');

      // Verify the message was created in the database
      const message = await messageRepository.findOne({
        where: { id: response.body.id },
      });
      expect(message).toBeDefined();
      expect(message.content).toBe('This is a mock AI response');
      expect(message.conversationId).toBe(conversationId);
      expect(message.role).toBe('ASSISTANT');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/messages/ai`)
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .post('/conversations/nonexistent-id/messages/ai')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/conversations/:conversationId/messages (GET)', () => {
    beforeEach(async () => {
      // Create some messages for the conversation
      await messageRepository.save([
        {
          content: 'User message 1',
          conversationId,
          role: 'USER',
        },
        {
          content: 'Assistant response 1',
          conversationId,
          role: 'ASSISTANT',
        },
        {
          content: 'User message 2',
          conversationId,
          role: 'USER',
        },
      ]);
    });

    it('should return all messages for a conversation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
      expect(response.body[0].content).toBe('User message 1');
      expect(response.body[1].content).toBe('Assistant response 1');
      expect(response.body[2].content).toBe('User message 2');
      expect(response.body[0].conversationId).toBe(conversationId);
      expect(response.body[0].role).toBe('USER');
      expect(response.body[1].role).toBe('ASSISTANT');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/conversations/${conversationId}/messages`)
        .expect(401);
    });

    it('should return an empty array if conversation has no messages', async () => {
      // Create a new conversation without messages
      const emptyConversation = await conversationRepository.save({
        title: 'Empty Conversation',
        userId,
      });

      const response = await request(app.getHttpServer())
        .get(`/conversations/${emptyConversation.id}/messages`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('/conversations/:conversationId/messages/search (GET)', () => {
    beforeEach(async () => {
      // Create some messages for the conversation
      await messageRepository.save([
        {
          content: 'Hello, how are you?',
          conversationId,
          role: 'USER',
        },
        {
          content: 'I am fine, thank you for asking!',
          conversationId,
          role: 'ASSISTANT',
        },
        {
          content: 'Can you tell me about artificial intelligence?',
          conversationId,
          role: 'USER',
        },
        {
          content:
            'Artificial intelligence (AI) is intelligence demonstrated by machines.',
          conversationId,
          role: 'ASSISTANT',
        },
      ]);
    });

    it('should search messages by keyword in a conversation', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/conversations/${conversationId}/messages/search?keyword=artificial`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].content).toContain('artificial intelligence');

      expect(response.body[1].content).toContain('Artificial intelligence');
    });

    it('should return an empty array if no messages match the keyword', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/conversations/${conversationId}/messages/search?keyword=nonexistent`,
        )
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(
          `/conversations/${conversationId}/messages/search?keyword=artificial`,
        )
        .expect(401);
    });
  });

  describe('/messages/:id (PUT)', () => {
    let messageId: string;

    beforeEach(async () => {
      // Create a message for the conversation
      const message = await messageRepository.save({
        content: 'Original message',
        conversationId,
        role: 'USER',
      });
      messageId = message.id;
    });

    it('should update a message', async () => {
      const response = await request(app.getHttpServer())
        .put(`/messages/${messageId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Updated message',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(messageId);
      expect(response.body.content).toBe('Updated message');
      expect(response.body.conversationId).toBe(conversationId);
      expect(response.body.role).toBe('USER');

      // Verify the message was updated in the database
      const message = await messageRepository.findOne({
        where: { id: messageId },
      });
      expect(message).toBeDefined();
      expect(message.content).toBe('Updated message');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .put(`/messages/${messageId}`)
        .send({
          content: 'Updated message',
        })
        .expect(401);
    });

    it('should return 404 if message not found', async () => {
      await request(app.getHttpServer())
        .put('/messages/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Updated message',
        })
        .expect(404);
    });
  });

  describe('/messages/:id (DELETE)', () => {
    let messageId: string;

    beforeEach(async () => {
      // Create a message for the conversation
      const message = await messageRepository.save({
        content: 'Message to be deleted',
        conversationId,
        role: 'USER',
      });
      messageId = message.id;
    });

    it('should delete a message', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/messages/${messageId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify the message was deleted from the database
      const message = await messageRepository.findOne({
        where: { id: messageId },
      });
      expect(message).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/messages/${messageId}`)
        .expect(401);
    });

    it('should return 404 if message not found', async () => {
      await request(app.getHttpServer())
        .delete('/messages/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
