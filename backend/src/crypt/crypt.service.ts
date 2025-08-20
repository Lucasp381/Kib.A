import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptService {
  decrypt(encryptedBase64: string, keyBase64: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    // Extraction de l'IV et du tag
    const iv = encrypted.slice(0, 12);           // 12 bytes IV
    const tag = encrypted.slice(encrypted.length - 16); // 16 bytes tag
    const ciphertext = encrypted.slice(12, encrypted.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
