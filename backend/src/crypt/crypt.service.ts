import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptService {
  private readonly ALGO = 'aes-256-gcm';
  private readonly IV_LENGTH = 12; // 96 bits = standard AES-GCM IV size
  private readonly TAG_LENGTH = 16; // 128 bits auth tag

  async encrypt(text: string, keyBase64: string): Promise<string> {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
      throw new Error('Invalid key length: must be 256 bits (base64 of 32 bytes)');
    }

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGO, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // concat iv + encrypted + tag
    const payload = Buffer.concat([iv, encrypted, tag]);
    return payload.toString('base64');
  }

  decrypt(encryptedBase64: string, keyBase64: string): string {
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) {
      throw new Error('Invalid key length: must be 256 bits (base64 of 32 bytes)');
    }

    const encrypted = Buffer.from(encryptedBase64, 'base64');
    const iv = encrypted.slice(0, this.IV_LENGTH);
    const tag = encrypted.slice(encrypted.length - this.TAG_LENGTH);
    const ciphertext = encrypted.slice(this.IV_LENGTH, encrypted.length - this.TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.ALGO, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
