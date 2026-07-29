import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApoyoAdministrativo } from './entities/apoyo-administrativo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { ApoyoAdministrativoService } from './apoyo-administrativo.service';
import { ApoyoAdministrativoController } from './apoyo-administrativo.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ApoyoAdministrativo, Usuario, Coordinador])],
    controllers: [ApoyoAdministrativoController],
    providers: [ApoyoAdministrativoService],
    exports: [TypeOrmModule, ApoyoAdministrativoService],
})
export class ApoyoAdministrativoModule {}
