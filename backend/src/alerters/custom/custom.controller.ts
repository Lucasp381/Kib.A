import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CustomService } from './custom.service';

@Controller('alerters/custom')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post('send')
  async send(@Body() body: any) {
    const { target, token, message } = body;
    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }
    return this.customService.sendCustomMessage(target, token, message);
  }
}
