import { Injectable } from '@nestjs/common';
import { IUserService } from './user.service.interface';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async create(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.userRepository.create({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    userData.updatedAt = new Date();

    return this.userRepository.update(id, userData);
  }
}
