export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

export interface CreateConversationDto {
  title: string;
}

export interface UpdateConversationDto {
  title: string;
}
