import { PartialType } from '@nestjs/mapped-types';
import { CreateCoordinadorDto } from './create-coordinador.dto';

export class UpdateCoordinadorDto extends PartialType(CreateCoordinadorDto) {}
