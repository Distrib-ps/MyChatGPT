import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { Message } from '../entities/message.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId')
  async findByConversationId(
    @Param('conversationId') conversationId: string,
  ): Promise<Message[]> {
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
    @Body(new ValidationPipe())
    createMessageDto: import('../dto/create-message.dto').CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.createUserMessage(
      conversationId,
      createMessageDto.content,
    );
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
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe())
    updateMessageDto: import('../dto/update-message.dto').UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(id, updateMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.messageService.delete(id);
    return { success: true };
  }
}
