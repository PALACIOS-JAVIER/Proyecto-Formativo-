import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjetoContractualService } from './objeto-contractual.service';
import { ObjetoContractualController } from './objeto-contractual.controller';
import { ObjetoContractual } from './entities/objeto-contractual.entity';
import { Area } from '../areas/entities/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjetoContractual, Area])],
  controllers: [ObjetoContractualController],
  providers: [ObjetoContractualService],
})
export class ObjetoContractualModule {}
