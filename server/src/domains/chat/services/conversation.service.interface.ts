import { Conversation } from '../entities/conversation.entity';

export interface IConversationService {
  findById(id: string): Promise<Conversation | null>;
  findByUserId(userId: string): Promise<Conversation[]>;
  findByShareId(shareId: string): Promise<Conversation | null>;
  searchByKeyword(userId: string, keyword: string): Promise<Conversation[]>;
  create(userId: string, title: string): Promise<Conversation>;
  update(id: string, data: Partial<Conversation>): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;
  generateShareLink(conversationId: string): Promise<string>;
}
