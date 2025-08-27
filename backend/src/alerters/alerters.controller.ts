import { Controller, Get, Post, Delete, Query, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AlertersService } from './alerters.service';
import { CreateAlerterDto } from './dto/create-alerter.dto';

@Controller('alerters')
export class AlertersController {
  constructor(private readonly alertersService: AlertersService) {}
    private readonly logger = new Logger(AlertersService.name);

  @Get()
  async getAlerters(
    @Query('type') type?: string,
    @Query('name') name?: string,
    @Query('id') id?: string,
  ) {
    try {
      return await this.alertersService.getAlerters({ type, name, id });
    } catch (error) {
      throw new HttpException(
        { error: 'Failed to fetch documents' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createOrUpdate(@Body() body: CreateAlerterDto) {
    try {
      this.logger.log(`Creating or updating alerter: ${body.name}`);
      return await this.alertersService.createOrUpdate(body);
    } catch (error) {
      throw new HttpException(
        { error: 'Failed to create/update document' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
    @Post('duplicate')
    async duplicateAlerter(@Body('originalId') originalId: string) {
      if (!originalId) {
        throw new HttpException(
          { error: 'Missing originalId parameter' },
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        return await this.alertersService.duplicate(originalId);
      } catch (error) {
        throw new HttpException(
          { error: 'Failed to duplicate document' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

  @Delete()
  async deleteAlerter(@Query('id') id: string) {
    if (!id) {
      throw new HttpException(
        { error: 'Missing id parameter' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.alertersService.delete(id);
    } catch (error) {
      throw new HttpException(
        { error: 'Failed to delete document' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
