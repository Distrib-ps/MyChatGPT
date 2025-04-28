import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the user', async () => {
      const user = { id: '1', email: 'test@example.com', username: 'testuser' };
      const expectedResult = { access_token: 'test-token', user };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const req = { user };
      const result = await controller.login(req);

      expect(result).toBe(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should call authService.register with the registerDto', async () => {
      const registerDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const expectedResult = {
        access_token: 'test-token',
        user: {
          id: '1',
          username: 'test',
          email: 'test@example.com',
        },
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toBe(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
