import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { DiscordModule } from 'src/alerters/discord/discord.module';
import { SlackModule } from 'src/alerters/slack/slack.module';
import { TeamsModule } from 'src/alerters/teams/teams.module';
import { EmailModule } from 'src/alerters/email/email.module';
import { CryptModule } from 'src/crypt/crypt.module'; // Import the CryptModule
import { IndexModule } from 'src/elastic/index/index.module'; // Import the IndexModule

@Module({
  imports: [DiscordModule, SlackModule, TeamsModule, EmailModule, CryptModule, IndexModule], // ⚠️ ici
  providers: [WorkersService],
})
export class WorkersModule {}
