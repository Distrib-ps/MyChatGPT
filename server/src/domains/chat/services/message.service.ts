import { Injectable } from '@nestjs/common';
import { IMessageService } from './message.service.interface';
import { Message, MessageRole } from '../entities/message.entity';
import { IMessageRepository } from '../repositories/message.repository.interface';

@Injectable()
export class MessageService implements IMessageService {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async findById(id: string): Promise<Message | null> {
    return this.messageRepository.findById(id);
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return this.messageRepository.findByConversationId(conversationId);
  }

  async searchInConversation(
    conversationId: string,
    keyword: string,
  ): Promise<Message[]> {
    return this.messageRepository.searchInConversation(conversationId, keyword);
  }

  async createUserMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    return this.messageRepository.create({
      conversationId,
      content,
      role: MessageRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createAssistantMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    return this.messageRepository.create({
      conversationId,
      content,
      role: MessageRole.ASSISTANT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: string, content: string): Promise<Message | null> {
    return this.messageRepository.update(id, {
      content,
      updatedAt: new Date(),
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.messageRepository.delete(id);
  }
}
