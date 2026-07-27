import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesGcService } from './informes-gc.service';
import { InformesGcController } from './informes-gc.controller';
import { InformeGC } from './entities/informe-gc.entity';
import { ObservacionGC } from './entities/observacion-gc.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InformeGC, ObservacionGC, Usuario])],
  controllers: [InformesGcController],
  providers: [InformesGcService],
  exports: [InformesGcService],
})
export class InformesGcModule {}
