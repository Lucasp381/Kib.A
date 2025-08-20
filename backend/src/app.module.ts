import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkersModule } from './workers/workers.module';
import { AlertersModule } from './alerters/alerters.module';
import { VariablesModule } from './elastic/variables/variables.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [     ConfigModule.forRoot({
    isGlobal: true, // rend le module disponible dans toute l'application
    envFilePath: '.env', // chemin vers ton fichier .env
  }),
  WorkersModule, AlertersModule, VariablesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
