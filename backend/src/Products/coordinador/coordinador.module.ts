import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordinador } from './entities/coordinador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CoordinadorService } from './coordinador.service';
import { CoordinadorController } from './coordinador.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Coordinador, Usuario])],
    controllers: [CoordinadorController],
    providers: [CoordinadorService],
    exports: [TypeOrmModule, CoordinadorService],
})
export class CoordinadorModule {}
