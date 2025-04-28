import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(user as User);

      const result = await service.findById('1');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = {
        id: '1',
        username: 'test',
        email: 'test@example.com',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(user as User);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  // La méthode findAll n'existe pas dans le service UserService

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = 'hashed_password';
      jest.spyOn(bcryptjs, 'hash').mockResolvedValue(hashedPassword as never);

      const createdUser = {
        id: '1',
        ...userData,
        password: hashedPassword,
      };

      jest.spyOn(repository, 'create').mockReturnValue(createdUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue(createdUser as User);

      const result = await service.create(userData);

      expect(result).toEqual(createdUser);
      expect(repository.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const userId = '1';
      const updateData = {
        username: 'updated',
      };

      const updatedUser = {
        id: userId,
        username: 'updated',
        email: 'test@example.com',
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findById').mockResolvedValue(updatedUser as User);

      const result = await service.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(repository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';
      const updateData = {
        username: 'updated',
      };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      // Simuler que findById retourne null après la mise à jour
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      const result = await service.update(userId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should call repository.delete with the user id', async () => {
      const userId = '1';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.delete(userId);

      expect(repository.delete).toHaveBeenCalledWith(userId);
    });

    it('should handle case when user was not found', async () => {
      const userId = 'nonexistent';

      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      // La méthode ne retourne rien (void), donc on vérifie juste qu'elle s'exécute sans erreur
      await expect(service.delete(userId)).resolves.not.toThrow();
    });
  });
});
