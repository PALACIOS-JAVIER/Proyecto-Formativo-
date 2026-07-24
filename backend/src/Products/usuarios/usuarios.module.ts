import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { Sede } from '../sede/entities/sede.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Area } from '../areas/entities/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Sede, Rol, Area])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
