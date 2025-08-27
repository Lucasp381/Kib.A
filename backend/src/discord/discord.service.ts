// discord.service.ts
import { Controller, Get, Headers, Param, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly baseURL = 'https://discord.com/api';

  constructor(private readonly httpService: HttpService) {}
async getCurrentBotInfo(authHeader: string) {
  const url = `${this.baseURL}/users/@me`;
  const response = await firstValueFrom(
    this.httpService.get(url, {
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    }),
  );
  return response.data;
}

async getUserById(userId: string, authHeader: string) {
  const url = `${this.baseURL}/users/${userId}`;
  const response = await firstValueFrom(
    this.httpService.get(url, {
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    }),
  );
  return response.data;
}

async getChannelById(channelId: string, authHeader: string) {
  this.logger.log(`Fetching channel info for ID: ${channelId}`);
  const url = `${this.baseURL}/channels/${channelId}`;
  const response = await firstValueFrom(
    this.httpService.get(url, {
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    }),
  );
  return response.data;
}


}
