import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampesenaObligacionesService } from './campesena-obligaciones.service';
import { CampesenaObligacionesController } from './campesena-obligaciones.controller';
import { CampesenaObligacione } from './entities/campesena-obligacione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampesenaObligacione])],
  controllers: [CampesenaObligacionesController],
  providers: [CampesenaObligacionesService],
})
export class CampesenaObligacionesModule {}
