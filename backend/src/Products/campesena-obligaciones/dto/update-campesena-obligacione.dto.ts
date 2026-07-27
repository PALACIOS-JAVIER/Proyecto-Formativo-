import { PartialType } from '@nestjs/mapped-types';
import { CreateCampesenaObligacioneDto } from './create-campesena-obligacione.dto';

export class UpdateCampesenaObligacioneDto extends PartialType(CreateCampesenaObligacioneDto) {}
