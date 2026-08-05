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
import { Coordinador } from './Products/coordinadores/entities/coordinador.entity';
import { ApoyoAdministrativo } from './Products/apoyo-administrativo/entities/apoyo-administrativo.entity';
import { ApoyoAdministrativoModule } from './Products/apoyo-administrativo/apoyo-administrativo.module';

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
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'admin',
      password: String(process.env.DB_PASSWORD || 'secretpassword'),
      database: process.env.DB_NAME || 'proyecto_formativo',
      entities: [Area, Rol, Sede, ObjetoContractual, Usuario, Especialidad, Historial, CampesenaObligacione, RegularFicObligacione, InformeGC, ObservacionGC, InformeGF, ObservacionGF, Notificacion, Coordinador, ApoyoAdministrativo],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: false,
    }),
    AreasModule,
    RolModule,
    SedeModule,
    ObjetoContractualModule,
    UsuariosModule,
    EspecialidadModule,
    HistorialModule,
    CampesenaObligacionesModule,
    RegularFicObligacionesModule,
    InformesGcModule,
    InformesGfModule,
    NotificacionesModule,
    AuthModule,
    ApoyoAdministrativoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
