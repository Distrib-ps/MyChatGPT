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
  Req,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../entities/conversation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request): Promise<Conversation[]> {
    const userId = req.user['id'];
    return this.conversationService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(
    @Req() req: Request,
    @Query('keyword') keyword: string,
  ): Promise<Conversation[]> {
    const userId = req.user['id'];
    return this.conversationService.searchByKeyword(userId, keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Conversation> {
    return this.conversationService.findById(id);
  }

  @Get('share/:shareId')
  async findByShareId(
    @Param('shareId') shareId: string,
  ): Promise<Conversation> {
    return this.conversationService.findByShareId(shareId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() data: { title: string },
  ): Promise<Conversation> {
    const userId = req.user['id'];
    return this.conversationService.create(userId, data.title);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Conversation>,
  ): Promise<Conversation> {
    return this.conversationService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.conversationService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async generateShareId(@Param('id') id: string): Promise<{ shareId: string }> {
    const shareId = await this.conversationService.generateShareId(id);
    return { shareId };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/share')
  async removeShareId(@Param('id') id: string): Promise<void> {
    return this.conversationService.removeShareId(id);
  }
}
