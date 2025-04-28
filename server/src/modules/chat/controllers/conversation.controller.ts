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
  ValidationPipe,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { Conversation } from '../entities/conversation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request): Promise<Conversation[]> {
    // L'ID utilisateur est stocké dans req.user.id selon la stratégie JWT
    const userId = req.user['id'];
    console.log('User ID from request:', userId);
    return this.conversationService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(
    @Req() req: Request,
    @Query('keyword') keyword: string,
  ): Promise<Conversation[]> {
    const userId = req.user['id'];
    console.log('User ID from request (search):', userId);
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
    @Body(new ValidationPipe()) createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    // Afficher l'objet utilisateur complet pour déboguer
    console.log('User object from request:', req.user);

    // Utiliser l'ID utilisateur depuis req.user.id
    const userId = req.user['id'];
    console.log('User ID for conversation creation:', userId);

    return this.conversationService.create(
      userId,
      createConversationDto.title || 'Nouvelle conversation',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    return this.conversationService.update(id, updateConversationDto);
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
