import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

// Utiliser des constantes au lieu d'un enum pour compatibilité SQLite
export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageRole.USER,
  })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  constructor(partial: Partial<Message>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
