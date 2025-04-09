import { Message } from '../entities/message.entity';

export interface IMessageService {
  findById(id: string): Promise<Message | null>;
  findByConversationId(conversationId: string): Promise<Message[]>;
  searchInConversation(
    conversationId: string,
    keyword: string,
  ): Promise<Message[]>;
  createUserMessage(conversationId: string, content: string): Promise<Message>;
  createAssistantMessage(
    conversationId: string,
    content: string,
  ): Promise<Message>;
  update(id: string, content: string): Promise<Message | null>;
  delete(id: string): Promise<boolean>;
}
