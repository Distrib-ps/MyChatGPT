import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { ConversationController } from './controllers/conversation.controller';
import { MessageController } from './controllers/message.controller';
import { OpenAIAdapter } from '../../infrastructure/adapters/ai/openai.adapter';
import { AIService } from '../../infrastructure/interfaces/ai.service.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [ConversationController, MessageController],
  providers: [
    ConversationService, 
    MessageService,
    {
      provide: AIService,
      useClass: OpenAIAdapter,
    }
  ],
  exports: [ConversationService, MessageService],
})
export class ChatModule {}
