import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApoyoAdministrativo } from './entities/apoyo-administrativo.entity';
import { ApoyoAdministrativoService } from './apoyo-administrativo.service';
import { ApoyoAdministrativoController } from './apoyo-administrativo.controller';
import { Coordinador } from '../coordinadores/entities/coordinador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Sede } from '../sede/entities/sede.entity';
import { Area } from '../areas/entities/area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApoyoAdministrativo, Coordinador, Usuario, Rol, Sede, Area]),
  ],
  controllers: [ApoyoAdministrativoController],
  providers: [ApoyoAdministrativoService],
  exports: [ApoyoAdministrativoService],
})
export class ApoyoAdministrativoModule {}
