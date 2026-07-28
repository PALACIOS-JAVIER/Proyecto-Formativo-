import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularFicObligacionesService } from './regular-fic-obligaciones.service';
import { RegularFicObligacionesController } from './regular-fic-obligaciones.controller';
import { RegularFicObligacione } from './entities/regular-fic-obligacione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegularFicObligacione])],
  controllers: [RegularFicObligacionesController],
  providers: [RegularFicObligacionesService],
})
export class RegularFicObligacionesModule {}
