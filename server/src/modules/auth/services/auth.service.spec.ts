import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcryptjs from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRATION') return '1d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await bcryptjs.hash('password', 10),
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user as any);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
      });
    });

    it('should return null if credentials are invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await bcryptjs.hash('password', 10),
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user as any);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return a JWT token when login is successful', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      };

      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await service.login(user as any);

      expect(result).toEqual({
        access_token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return a JWT token', async () => {
      const registerDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const createdUser = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(createdUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'test-token',
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
        },
      });
      expect(userService.create).toHaveBeenCalledWith({
        username: 'test',
        email: 'test@example.com',
        password: expect.any(String),
      });
    });

    it('should throw an error if user already exists', async () => {
      const registerDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const existingUser = {
        id: '1',
        email: 'test@example.com',
      };

      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValue(existingUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });
});
