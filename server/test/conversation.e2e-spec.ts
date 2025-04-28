import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/user/entities/user.entity';
import { Conversation } from '../src/modules/chat/entities/conversation.entity';

describe('ConversationController (e2e)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: any; // Used for user creation
  let conversationRepository;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    conversationRepository = moduleFixture.get(
      getRepositoryToken(Conversation),
    );

    // Create a user and get JWT token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'conversationuser',
        email: 'conversation@example.com',
        password: 'password123',
      });

    jwtToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;
  });

  beforeEach(async () => {
    // Clear conversations before each test
    await conversationRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/conversations (POST)', () => {
    it('should create a new conversation', async () => {
      const response = await request(app.getHttpServer())
        .post('/conversations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Test Conversation',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Conversation');
      expect(response.body.userId).toBe(userId);

      // Verify the conversation was created in the database
      const conversation = await conversationRepository.findOne({
        where: { id: response.body.id },
      });
      expect(conversation).toBeDefined();
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.userId).toBe(userId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/conversations')
        .send({
          title: 'Test Conversation',
        })
        .expect(401);
    });
  });

  describe('/conversations (GET)', () => {
    beforeEach(async () => {
      // Create some conversations for the user
      await conversationRepository.save([
        {
          title: 'Conversation 1',
          userId,
        },
        {
          title: 'Conversation 2',
          userId,
        },
      ]);
    });

    it('should return all conversations for the authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/conversations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Conversation 1');
      expect(response.body[1].title).toBe('Conversation 2');
      expect(response.body[0].userId).toBe(userId);
      expect(response.body[1].userId).toBe(userId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/conversations').expect(401);
    });
  });

  describe('/conversations/:id (GET)', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Create a conversation for the user
      const conversation = await conversationRepository.save({
        title: 'Test Conversation',
        userId,
      });
      conversationId = conversation.id;
    });

    it('should return a conversation by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(conversationId);
      expect(response.body.title).toBe('Test Conversation');
      expect(response.body.userId).toBe(userId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/conversations/${conversationId}`)
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .get('/conversations/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/conversations/:id (PUT)', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Create a conversation for the user
      const conversation = await conversationRepository.save({
        title: 'Original Title',
        userId,
      });
      conversationId = conversation.id;
    });

    it('should update a conversation', async () => {
      const response = await request(app.getHttpServer())
        .put(`/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(conversationId);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.userId).toBe(userId);

      // Verify the conversation was updated in the database
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId },
      });
      expect(conversation).toBeDefined();
      expect(conversation.title).toBe('Updated Title');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .put(`/conversations/${conversationId}`)
        .send({
          title: 'Updated Title',
        })
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .put('/conversations/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(404);
    });
  });

  describe('/conversations/:id (DELETE)', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Create a conversation for the user
      const conversation = await conversationRepository.save({
        title: 'To Be Deleted',
        userId,
      });
      conversationId = conversation.id;
    });

    it('should delete a conversation', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify the conversation was deleted from the database
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId },
      });
      expect(conversation).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/conversations/${conversationId}`)
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .delete('/conversations/nonexistent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/conversations/:id/share (POST)', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Create a conversation for the user
      const conversation = await conversationRepository.save({
        title: 'To Be Shared',
        userId,
      });
      conversationId = conversation.id;
    });

    it('should generate a share ID for a conversation', async () => {
      const response = await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/share`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('shareId');
      expect(typeof response.body.shareId).toBe('string');

      // Verify the share ID was saved in the database
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId },
      });
      expect(conversation).toBeDefined();
      expect(conversation.shareId).toBe(response.body.shareId);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/conversations/${conversationId}/share`)
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .post('/conversations/nonexistent-id/share')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/conversations/:id/share (DELETE)', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Create a conversation for the user with a share ID
      const conversation = await conversationRepository.save({
        title: 'Shared Conversation',
        userId,
        shareId: 'test-share-id',
      });
      conversationId = conversation.id;
    });

    it('should remove the share ID from a conversation', async () => {
      await request(app.getHttpServer())
        .delete(`/conversations/${conversationId}/share`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204);

      // Verify the share ID was removed from the database
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId },
      });
      expect(conversation).toBeDefined();
      expect(conversation.shareId).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/conversations/${conversationId}/share`)
        .expect(401);
    });

    it('should return 404 if conversation not found', async () => {
      await request(app.getHttpServer())
        .delete('/conversations/nonexistent-id/share')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/conversations/share/:shareId (GET)', () => {
    let conversationId: string;
    let shareId: string;

    beforeEach(async () => {
      // Create a conversation for the user with a share ID
      shareId = 'test-share-id';
      const conversation = await conversationRepository.save({
        title: 'Shared Conversation',
        userId,
        shareId,
      });
      conversationId = conversation.id;
    });

    it('should return a conversation by share ID without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/conversations/share/${shareId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(conversationId);
      expect(response.body.title).toBe('Shared Conversation');
      expect(response.body.shareId).toBe(shareId);
    });

    it('should return 404 if share ID not found', async () => {
      await request(app.getHttpServer())
        .get('/conversations/share/nonexistent-share-id')
        .expect(404);
    });
  });
});
