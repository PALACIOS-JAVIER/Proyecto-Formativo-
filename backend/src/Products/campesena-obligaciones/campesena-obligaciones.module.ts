import { Module } from '@nestjs/common';
import { CampesenaObligacionesService } from './campesena-obligaciones.service';
import { CampesenaObligacionesController } from './campesena-obligaciones.controller';

@Module({
  controllers: [CampesenaObligacionesController],
  providers: [CampesenaObligacionesService],
})
export class CampesenaObligacionesModule {}
