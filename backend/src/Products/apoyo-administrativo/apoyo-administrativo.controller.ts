import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { ApoyoAdministrativoService } from './apoyo-administrativo.service';
import { CreateApoyoAdministrativoDto } from './dto/create-apoyo-administrativo.dto';

@Controller('apoyo-administrativo')
export class ApoyoAdministrativoController {
  constructor(private readonly apoyoService: ApoyoAdministrativoService) {}

  @Post()
  create(@Body() dto: CreateApoyoAdministrativoDto, @Request() req: any) {
    const loggedUserId = req.user?.sub;
    return this.apoyoService.create(dto, loggedUserId);
  }

  @Get()
  findAll() {
    return this.apoyoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apoyoService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apoyoService.remove(+id);
  }
}
