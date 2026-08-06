import { PartialType } from '@nestjs/mapped-types';
import { CreateApoyoAdministrativoDto } from './create-apoyo-administrativo.dto';

export class UpdateApoyoAdministrativoDto extends PartialType(CreateApoyoAdministrativoDto) {}
