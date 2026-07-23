import { PartialType } from '@nestjs/mapped-types';
import { CreateObjetoContractualDto } from './create-objeto-contractual.dto';

export class UpdateObjetoContractualDto extends PartialType(CreateObjetoContractualDto) {}
