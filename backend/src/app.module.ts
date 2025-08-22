import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkersModule } from './workers/workers.module';
import { TeamsModule } from './alerters/teams/teams.module';
import { VariablesModule } from './elastic/variables/variables.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [     ConfigModule.forRoot({
    isGlobal: true, // rend le module disponible dans toute l'application
    envFilePath: '.env', // chemin vers ton fichier .env
  }),
  WorkersModule, TeamsModule, VariablesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
