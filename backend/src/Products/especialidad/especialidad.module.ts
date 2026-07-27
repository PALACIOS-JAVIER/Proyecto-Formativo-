import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadController } from './especialidad.controller';
import { Especialidad } from './entities/especialidad.entity';
import { Area } from '../areas/entities/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Especialidad, Area])],
  controllers: [EspecialidadController],
  providers: [EspecialidadService],
  exports: [EspecialidadService, TypeOrmModule],
})
export class EspecialidadModule {}
