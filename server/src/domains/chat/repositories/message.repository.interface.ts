import { Message } from '../entities/message.entity';

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByConversationId(conversationId: string): Promise<Message[]>;
  searchInConversation(
    conversationId: string,
    keyword: string,
  ): Promise<Message[]>;
  create(message: Partial<Message>): Promise<Message>;
  update(id: string, message: Partial<Message>): Promise<Message | null>;
  delete(id: string): Promise<boolean>;
}
