import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedesService } from './sede.service';
import { SedesController } from './sede.controller';
import { Sede } from './entities/sede.entity';
import { Rol } from '../rol/entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sede, Rol])],
  controllers: [SedesController],
  providers: [SedesService],
})
export class SedeModule {}
