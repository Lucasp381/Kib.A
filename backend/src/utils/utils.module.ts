
// src/crypt/crypt.module.ts
import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Module({
  providers: [UtilsService],
  exports: [UtilsService], // <- essentiel pour que d'autres modules puissent l'utiliser
})
export class UtilsModule {}

