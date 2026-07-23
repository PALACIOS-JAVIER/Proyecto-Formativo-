import { Module } from '@nestjs/common';
import { ObjetoContractualService } from './objeto-contractual.service';
import { ObjetoContractualController } from './objeto-contractual.controller';

@Module({
  controllers: [ObjetoContractualController],
  providers: [ObjetoContractualService],
})
export class ObjetoContractualModule {}
