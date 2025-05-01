export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: MessageRole;
  createdAt: string;
  updatedAt: string;
}

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface CreateMessageDto {
  content: string;
}

export interface UpdateMessageDto {
  content: string;
}
