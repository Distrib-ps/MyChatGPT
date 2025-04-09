import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Conversation } from '../../../domains/chat/entities/conversation.entity';
import { IConversationRepository } from '../../../domains/chat/repositories/conversation.repository.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class TypeOrmConversationRepository implements IConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async findById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShareId(shareId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { shareId },
      relations: ['messages'],
    });
  }

  async searchByKeyword(
    userId: string,
    keyword: string,
  ): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: [
        { userId, title: Like(`%${keyword}%`) },
        { userId, messages: { content: Like(`%${keyword}%`) } },
      ],
      relations: ['messages'],
    });
  }

  async create(conversation: Partial<Conversation>): Promise<Conversation> {
    const newConversation = this.conversationRepository.create(conversation);
    return this.conversationRepository.save(newConversation);
  }

  async update(
    id: string,
    conversation: Partial<Conversation>,
  ): Promise<Conversation | null> {
    await this.conversationRepository.update(id, conversation);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.conversationRepository.delete(id);
    return result.affected > 0;
  }

  async generateShareId(conversationId: string): Promise<string> {
    const shareId = randomBytes(16).toString('hex');
    await this.update(conversationId, { shareId });
    return shareId;
  }
}
