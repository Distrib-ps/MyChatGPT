import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/user/entities/user.entity';
import * as bcryptjs from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtToken: string; // Used in other tests

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');

      // Save the token for later tests
      jwtToken = response.body.access_token;

      // Verify the user was created in the database
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');

      // Verify the password was hashed
      const isPasswordValid = await bcryptjs.compare(
        'password123',
        user.password,
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should return 400 if email is already taken', async () => {
      // Create a user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(201);

      // Try to register with the same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User already exists');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          // Missing email
          password: 'short', // Too short password
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer()).post('/auth/register').send({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login and return a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('login@example.com');
    });

    it('should return 401 if credentials are invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });
});
