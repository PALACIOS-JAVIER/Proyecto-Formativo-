import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';

@Controller('especialidades')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Post()
  create(@Body() dto: CreateEspecialidadDto) {
    return this.especialidadService.create(dto);
  }

  @Get()
  findAll(@Query('id_area') id_area?: string) {
    if (id_area) return this.especialidadService.findByArea(+id_area);
    return this.especialidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.especialidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEspecialidadDto) {
    return this.especialidadService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.especialidadService.remove(+id);
  }
}
