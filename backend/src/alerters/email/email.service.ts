import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { UtilsService } from '../../utils/utils.service';

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
    this.logger.log("Sending Email")

    if (!smtp_server || !port || !username || !password || !to_addresses) {
      return 
    }
    if (!message) {
      return 
    }
    message = await this.utilsService.replacePlaceholders(message, alert);
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
    console.log("mailOptions", mailOptions);
  
    const info = await transporter.sendMail(mailOptions);
  
  } catch (error) {
    this.logger.error("Error sending email:", error);
    throw error;
  }
  }
}
