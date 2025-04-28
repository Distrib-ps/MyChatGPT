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
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column('text')
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageRole.USER,
  })
  role: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Message> = {}) {
    Object.assign(this, partial);
  }
}
