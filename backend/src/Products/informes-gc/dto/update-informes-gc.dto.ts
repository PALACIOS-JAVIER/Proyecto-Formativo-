import { PartialType } from '@nestjs/mapped-types';
import { CreateInformesGcDto } from './create-informes-gc.dto';

export class UpdateInformesGcDto extends PartialType(CreateInformesGcDto) {}
