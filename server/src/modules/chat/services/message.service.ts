import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageRole } from '../entities/message.entity';
import { AIService } from '../../../infrastructure/interfaces/ai.service.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private aiService: AIService,
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

  async searchInConversation(
    conversationId: string,
    keyword: string,
  ): Promise<Message[]> {
    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.content LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async createUserMessage(conversationId: string, content: string): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      content,
      role: MessageRole.USER,
    });

    return this.messageRepository.save(message);
  }

  async createAssistantMessage(conversationId: string): Promise<Message> {
    // Get conversation history
    const messages = await this.findByConversationId(conversationId);
    
    // Format messages for AI service
    const formattedMessages = messages.map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'assistant',
      content: msg.content,
    }));
    
    // Generate AI response
    const aiResponse = await this.aiService.generateResponse(formattedMessages);
    
    // Create and save the assistant message
    const message = this.messageRepository.create({
      conversationId,
      content: aiResponse,
      role: MessageRole.ASSISTANT,
    });

    return this.messageRepository.save(message);
  }

  async update(id: string, data: Partial<Message>): Promise<Message> {
    await this.messageRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.messageRepository.delete(id);
  }
}
