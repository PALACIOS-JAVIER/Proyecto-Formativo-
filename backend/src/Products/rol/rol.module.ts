import { Module } from '@nestjs/common';
import { RolesService } from './rol.service';
import { RolesController } from './rol.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolModule {}
