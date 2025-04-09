import { User } from '../entities/user.entity';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
}
