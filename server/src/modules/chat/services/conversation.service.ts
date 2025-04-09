import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async findById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });
  }

  async findByShareId(shareId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { shareId },
      relations: ['messages'],
    });
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async searchByKeyword(userId: string, keyword: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.userId = :userId', { userId })
      .andWhere('conversation.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async create(userId: string, title: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      userId,
      title,
    });

    return this.conversationRepository.save(conversation);
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    await this.conversationRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.conversationRepository.delete(id);
  }

  async generateShareId(id: string): Promise<string> {
    const shareId = randomBytes(16).toString('hex');
    await this.conversationRepository.update(id, { shareId });
    return shareId;
  }

  async removeShareId(id: string): Promise<void> {
    await this.conversationRepository.update(id, { shareId: null });
  }
}
