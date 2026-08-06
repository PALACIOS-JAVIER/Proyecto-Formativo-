import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesGfService } from './informes-gf.service';
import { InformesGfController } from './informes-gf.controller';
import { InformeGF } from './entities/informe-gf.entity';
import { ObservacionGF } from './entities/observacion-gf.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Notificacion } from '../notificaciones/entities/notificacione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InformeGF, ObservacionGF, Usuario, Notificacion])],
  controllers: [InformesGfController],
  providers: [InformesGfService],
  exports: [InformesGfService],
})
export class InformesGfModule {}
