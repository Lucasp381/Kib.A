import { Controller, Post, Body, Get } from '@nestjs/common';
import { WorkersService } from './worker.service';

@Controller('worker')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post('start')
  start() {
    this.workersService.start();
    return { status: 'started' };
  }

  @Post('stop')
  stop() {
    this.workersService.stop();
    return { status: 'stopped' };
  }

  @Post('pause')
  pause(@Body('minutes') minutes: number) {
    const parsedMinutes = Number(minutes);
    if (isNaN(parsedMinutes) || parsedMinutes <= 0) {
      return { error: 'minutes must be a positive number' };
    }
    this.workersService.pause(parsedMinutes);
    return { status: `paused for ${parsedMinutes} minutes` };
  }

@Get("status")
status() {
  return this.workersService.getStatus();
}
}
