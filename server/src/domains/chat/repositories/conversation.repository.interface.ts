import { Conversation } from '../entities/conversation.entity';

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByUserId(userId: string): Promise<Conversation[]>;
  findByShareId(shareId: string): Promise<Conversation | null>;
  searchByKeyword(userId: string, keyword: string): Promise<Conversation[]>;
  create(conversation: Partial<Conversation>): Promise<Conversation>;
  update(id: string, conversation: Partial<Conversation>): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;
  generateShareId(conversationId: string): Promise<string>;
}
