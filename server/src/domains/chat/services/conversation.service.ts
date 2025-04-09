import { Injectable } from '@nestjs/common';
import { IConversationService } from './conversation.service.interface';
import { Conversation } from '../entities/conversation.entity';
import { IConversationRepository } from '../repositories/conversation.repository.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class ConversationService implements IConversationService {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async findById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findByUserId(userId);
  }

  async findByShareId(shareId: string): Promise<Conversation | null> {
    return this.conversationRepository.findByShareId(shareId);
  }

  async searchByKeyword(userId: string, keyword: string): Promise<Conversation[]> {
    return this.conversationRepository.searchByKeyword(userId, keyword);
  }

  async create(userId: string, title: string): Promise<Conversation> {
    return this.conversationRepository.create({
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    data.updatedAt = new Date();
    return this.conversationRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.conversationRepository.delete(id);
  }

  async generateShareLink(conversationId: string): Promise<string> {
    const shareId = await this.conversationRepository.generateShareId(conversationId);
    return shareId;
  }
}
