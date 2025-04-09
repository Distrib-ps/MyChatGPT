import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { Message } from '../entities/message.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId')
  async findByConversationId(@Param('conversationId') conversationId: string): Promise<Message[]> {
    return this.messageService.findByConversationId(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId/search')
  async searchInConversation(
    @Param('conversationId') conversationId: string,
    @Query('keyword') keyword: string,
  ): Promise<Message[]> {
    return this.messageService.searchInConversation(conversationId, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversation/:conversationId/user')
  async createUserMessage(
    @Param('conversationId') conversationId: string,
    @Body() data: { content: string },
  ): Promise<Message> {
    return this.messageService.createUserMessage(conversationId, data.content);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversation/:conversationId/assistant')
  async createAssistantMessage(
    @Param('conversationId') conversationId: string,
  ): Promise<Message> {
    return this.messageService.createAssistantMessage(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Message>): Promise<Message> {
    return this.messageService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.messageService.delete(id);
  }
}
