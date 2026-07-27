import { PartialType } from '@nestjs/mapped-types';
import { CreateInformesGfDto } from './create-informes-gf.dto';

export class UpdateInformesGfDto extends PartialType(CreateInformesGfDto) {}
