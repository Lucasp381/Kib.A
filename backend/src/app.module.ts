import { KibanaModule } from './kibana/kibana.module';
import { KibanaController } from './kibana/kibana.controller';
import { AlertersModule } from './alerters/alerters.module';
import { AlertersController } from './alerters/alerters.controller';
import { AlertersService } from './alerters/alerters.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkersModule } from './workers/workers.module';
import { TeamsModule } from './alerters/teams/teams.module';
import { TelegramModule } from './alerters/telegram/telegram.module';
import { VariablesModule } from './elastic/variables/variables.module';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { CryptModule } from './crypt/crypt.module';
import { ElasticsearchModule } from './clients/elasticsearch.module';

@Module({
  imports: [
    KibanaModule,
    AlertersModule, ConfigModule.forRoot({
      isGlobal: true, // rend le module disponible dans toute l'application
      envFilePath: '.env', // chemin vers ton fichier .env
    }),
    WorkersModule, TeamsModule, VariablesModule, TelegramModule, DiscordModule, AlertersModule, CryptModule, ElasticsearchModule],
  controllers: [
    KibanaController,
    AlertersController, AppController],
  providers: [
    AlertersService, AppService],
})
export class AppModule { }
