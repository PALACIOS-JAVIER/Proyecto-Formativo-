import { Module } from '@nestjs/common';
import { SedesService } from './sede.service';
import { SedesController } from './sede.controller';

@Module({
  controllers: [SedesController],
  providers: [SedesService],
})
export class SedeModule {}
