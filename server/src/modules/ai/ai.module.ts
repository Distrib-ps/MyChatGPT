import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIAdapter } from './adapters/openai.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'AIService',
      useClass: OpenAIAdapter,
    },
  ],
  exports: ['AIService'],
})
export class AIModule {}
