import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { randomBytes } from 'crypto';
import { IConversationService } from '../interfaces/conversation.service.interface';

@Injectable()
export class ConversationService implements IConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async findById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });
  }

  async findByShareId(shareId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { shareId },
      relations: ['messages'],
    });
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async searchByKeyword(
    userId: string,
    keyword: string,
  ): Promise<Conversation[]> {
    console.log(
      `Service - Recherche pour l'utilisateur ${userId} avec le mot-clé: "${keyword}"`,
    );

    // Si le mot-clé est vide, retourner toutes les conversations
    if (!keyword || keyword.trim() === '') {
      console.log('Mot-clé vide, retour de toutes les conversations');
      return this.findByUserId(userId);
    }

    try {
      // Utiliser LOWER pour une recherche insensible à la casse
      const results = await this.conversationRepository
        .createQueryBuilder('conversation')
        .where('conversation.userId = :userId', { userId })
        .andWhere('LOWER(conversation.title) LIKE LOWER(:keyword)', {
          keyword: `%${keyword.toLowerCase()}%`,
        })
        .orderBy('conversation.updatedAt', 'DESC')
        .getMany();

      console.log(
        `Service - ${results.length} conversations trouvées pour le mot-clé "${keyword}"`,
      );
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche de conversations:', error);
      throw error;
    }
  }

  async create(userId: string, title: string): Promise<Conversation> {
    console.log('Creating conversation with userId:', userId);
    console.log('Creating conversation with title:', title);

    try {
      // Créer directement l'objet conversation
      const conversation = new Conversation();
      conversation.userId = userId;
      conversation.title = title || 'Nouvelle conversation';
      // Sauvegarder l'objet

      const savedConversation =
        await this.conversationRepository.save(conversation);

      console.log('Saved conversation:', savedConversation);
      return savedConversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    await this.conversationRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    console.log(`Service - Tentative de suppression de la conversation ${id}`);
    try {
      // Vérifier si la conversation existe avant de la supprimer
      const conversation = await this.conversationRepository.findOne({
        where: { id },
        relations: ['messages'],
      });

      if (!conversation) {
        console.log(`Service - Conversation ${id} non trouvée`);
        return false;
      }

      console.log(
        `Service - Conversation ${id} trouvée, suppression en cours...`,
      );

      // Utiliser une transaction pour s'assurer que tout est supprimé correctement
      const queryRunner =
        this.conversationRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Supprimer d'abord les messages associés à la conversation
        if (conversation.messages && conversation.messages.length > 0) {
          console.log(
            `Service - Suppression de ${conversation.messages.length} messages associés`,
          );
          await queryRunner.manager.query(
            'DELETE FROM messages WHERE "conversationId" = ?',
            [id],
          );
        }

        // Ensuite, supprimer la conversation
        await queryRunner.manager.delete('conversations', { id });

        // Valider la transaction
        await queryRunner.commitTransaction();
        console.log(
          `Service - Conversation et messages associés supprimés avec succès`,
        );
        return true;
      } catch (transactionError) {
        // En cas d'erreur, annuler la transaction
        await queryRunner.rollbackTransaction();
        console.error(
          `Service - Erreur lors de la transaction de suppression:`,
          transactionError,
        );
        throw transactionError;
      } finally {
        // Libérer le queryRunner
        await queryRunner.release();
      }
    } catch (error) {
      console.error(
        `Service - Erreur lors de la suppression de la conversation ${id}:`,
        error,
      );
      throw error;
    }
  }

  async generateShareId(id: string): Promise<string> {
    const shareId = randomBytes(16).toString('hex');
    await this.conversationRepository.update(id, { shareId });
    return shareId;
  }

  async generateShareLink(conversationId: string): Promise<string> {
    const shareId = await this.generateShareId(conversationId);
    return `/conversations/share/${shareId}`;
  }

  async removeShareId(id: string): Promise<void> {
    await this.conversationRepository.update(id, { shareId: null });
  }
}
