import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('alerters/slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Post('send')
  async send(@Body() body: any) {
    const { channelName, token, message } = body;
    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }
    return this.slackService.sendSlackMessage(channelName, token, message);
  }
}
