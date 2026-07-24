import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './rol.service';
import { RolesController } from './rol.controller';
import { Rol } from './entities/rol.entity';
import { Sede } from '../sede/entities/sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Sede])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolModule {}
