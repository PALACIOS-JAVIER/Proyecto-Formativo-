import { PartialType } from '@nestjs/mapped-types';
import { CreateRegularFicObligacioneDto } from './create-regular-fic-obligacione.dto';

export class UpdateRegularFicObligacioneDto extends PartialType(CreateRegularFicObligacioneDto) {}
