import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { AreasModule } from './Products/areas/areas.module';
import { RolModule } from './Products/rol/rol.module';
import { SedeModule } from './Products/sede/sede.module';
import { Area } from './Products/areas/entities/area.entity';
import { Rol } from './Products/rol/entities/rol.entity';
import { Sede } from './Products/sede/entities/sede.entity';
import { ObjetoContractualModule } from './Products/objeto-contractual/objeto-contractual.module';
import { ObjetoContractual } from './Products/objeto-contractual/entities/objeto-contractual.entity';
import { UsuariosModule } from './Products/usuarios/usuarios.module';
import { Usuario } from './Products/usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [Area, Rol, Sede, ObjetoContractual, Usuario],
      synchronize: true,
      logging: false,
    }),
    AreasModule,
    RolModule,
    SedeModule,
    ObjetoContractualModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
