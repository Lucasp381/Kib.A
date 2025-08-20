import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('alerters/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async send(@Body() body: any) {
    const { smtp_server, port, username, password, from_address, to_addresses, cc_addresses, subject, message } = body;
    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }
    return this.emailService.sendEmailMessage(smtp_server, port, username, password, from_address, to_addresses, cc_addresses, subject, message);
  }
}
