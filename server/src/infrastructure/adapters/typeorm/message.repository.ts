import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message } from '../../../domains/chat/entities/message.entity';
import { IMessageRepository } from '../../../domains/chat/repositories/message.repository.interface';

@Injectable()
export class TypeOrmMessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findById(id: string): Promise<Message | null> {
    return this.messageRepository.findOne({ where: { id } });
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async searchInConversation(conversationId: string, keyword: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        conversationId,
        content: Like(`%${keyword}%`),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = this.messageRepository.create(message);
    return this.messageRepository.save(newMessage);
  }

  async update(id: string, message: Partial<Message>): Promise<Message | null> {
    await this.messageRepository.update(id, message);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.messageRepository.delete(id);
    return result.affected > 0;
  }
}
