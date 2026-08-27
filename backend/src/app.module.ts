import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { CoordinadorModule } from './Products/coordinador/coordinador.module';
import { Coordinador } from './Products/coordinador/entities/coordinador.entity';
import { ApoyoAdministrativoModule } from './Products/apoyo-administrativo/apoyo-administrativo.module';
import { ApoyoAdministrativo } from './Products/apoyo-administrativo/entities/apoyo-administrativo.entity';
import { UsuariosModule } from './Products/usuarios/usuarios.module';
import { Usuario } from './Products/usuarios/entities/usuario.entity';
import { EspecialidadModule } from './Products/especialidad/especialidad.module';
import { Especialidad } from './Products/especialidad/entities/especialidad.entity';
import { HistorialModule } from './Products/historial/historial.module';
import { Historial } from './Products/historial/entities/historial.entity';
import { AuthModule } from './auth/auth.module';
import { CampesenaObligacionesModule } from './Products/campesena-obligaciones/campesena-obligaciones.module';
import { CampesenaObligacione } from './Products/campesena-obligaciones/entities/campesena-obligacione.entity';
import { RegularFicObligacionesModule } from './Products/regular-fic-obligaciones/regular-fic-obligaciones.module';
import { RegularFicObligacione } from './Products/regular-fic-obligaciones/entities/regular-fic-obligacione.entity';
import { InformesGcModule } from './Products/informes-gc/informes-gc.module';
import { InformeGC } from './Products/informes-gc/entities/informe-gc.entity';
import { ObservacionGC } from './Products/informes-gc/entities/observacion-gc.entity';
import { InformesGfModule } from './Products/informes-gf/informes-gf.module';
import { InformeGF } from './Products/informes-gf/entities/informe-gf.entity';
import { ObservacionGF } from './Products/informes-gf/entities/observacion-gf.entity';
import { NotificacionesModule } from './Products/notificaciones/notificaciones.module';
import { Notificacion } from './Products/notificaciones/entities/notificacione.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Area,
        Rol,
        Sede,
        ObjetoContractual,
        Coordinador,
        ApoyoAdministrativo,
        Usuario,
        Especialidad,
        Historial,
        CampesenaObligacione,
        RegularFicObligacione,
        InformeGC,
        ObservacionGC,
        InformeGF,
        ObservacionGF,
        Notificacion,
      ],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: false,
    }),
    AreasModule,
    RolModule,
    SedeModule,
    ObjetoContractualModule,
    CoordinadorModule,
    ApoyoAdministrativoModule,
    UsuariosModule,
    EspecialidadModule,
    HistorialModule,
    CampesenaObligacionesModule,
    RegularFicObligacionesModule,
    InformesGcModule,
    InformesGfModule,
    NotificacionesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

