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
  HttpException,
  HttpStatus,
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
    console.log(
      'Controller - Recherche pour utilisateur:',
      userId,
      'avec mot-clé:',
      keyword,
    );

    try {
      // Appeler le service de recherche avec le mot-clé
      const results = await this.conversationService.searchByKeyword(
        userId,
        keyword,
      );
      console.log(`Controller - ${results.length} conversations trouvées`);
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche de conversations:', error);
      throw new HttpException(
        'Erreur lors de la recherche de conversations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message?: string }> {
    console.log(
      `Controller - Tentative de suppression de la conversation ${id} par l'utilisateur ${req.user['id']}`,
    );
    try {
      // Vérifier d'abord si la conversation existe
      const conversation = await this.conversationService.findById(id);

      if (!conversation) {
        console.log(`Controller - Conversation ${id} non trouvée`);
        return {
          success: false,
          message: `Conversation avec l'ID ${id} non trouvée`,
        };
      }

      // Vérifier si l'utilisateur est le propriétaire de la conversation
      if (conversation.userId !== req.user['id']) {
        console.log(
          `Controller - L'utilisateur ${req.user['id']} n'est pas autorisé à supprimer la conversation ${id}`,
        );
        return {
          success: false,
          message:
            "Vous n'\u00eates pas autorisé à supprimer cette conversation",
        };
      }

      const result = await this.conversationService.delete(id);
      console.log(`Controller - Résultat de la suppression:`, result);
      return { success: result };
    } catch (error) {
      console.error(
        `Controller - Erreur lors de la suppression de la conversation ${id}:`,
        error,
      );
      throw new HttpException(
        'Erreur lors de la suppression de la conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
