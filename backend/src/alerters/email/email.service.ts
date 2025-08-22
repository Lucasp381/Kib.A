import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { UtilsService } from '../../utils/utils.service';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly utilsService: UtilsService) {}

  async sendEmailMessage(smtp_server : string, 
    port: number, 
    username: string, 
    password: string,
    from_address: string, 
    to_addresses: string[], 
    cc_addresses: string[], 
    subject: string,
    message: string,
  alert?: any) {

    if (!smtp_server || !port || !username || !password || !to_addresses) {
      return 
    }
    if (!message) {
      return 
    }
    this.logger.debug(`Sending email to: ${to_addresses} with subject: ${subject}`);
    message = await this.utilsService.replacePlaceholders(message, alert);
    // Sanitize message
    message = sanitizeHtml(message);
    try {
    // get the channel ID from the name
    const transporter = nodemailer.createTransport({
      host: smtp_server,
      port: Number(port),
      secure: true, // true si port 465
      auth: {
        user: username,
        pass: password,
      },
    });
  
    const mailOptions = {
      from: from_address,
      to : to_addresses,
      subject : subject,
      html : message,
      cc: cc_addresses ? cc_addresses : undefined,
  
    };
  
    const info = await transporter.sendMail(mailOptions);
  
  } catch (error) {
    this.logger.error("Error sending email:", error);
    throw error;
  }
  }
}
