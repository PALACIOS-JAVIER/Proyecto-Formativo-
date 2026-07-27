import { Module } from '@nestjs/common';
import { RegularFicObligacionesService } from './regular-fic-obligaciones.service';
import { RegularFicObligacionesController } from './regular-fic-obligaciones.controller';

@Module({
  controllers: [RegularFicObligacionesController],
  providers: [RegularFicObligacionesService],
})
export class RegularFicObligacionesModule {}
