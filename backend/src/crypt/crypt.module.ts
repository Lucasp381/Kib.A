// src/crypt/crypt.module.ts
import { Module } from '@nestjs/common';
import { CryptService } from './crypt.service';

@Module({
  providers: [CryptService],
  exports: [CryptService], // <- essentiel pour que d'autres modules puissent l'utiliser
})
export class CryptModule {}
