import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampesenaObligacionesService } from './campesena-obligaciones.service';
import { CreateCampesenaObligacioneDto } from './dto/create-campesena-obligacione.dto';
import { UpdateCampesenaObligacioneDto } from './dto/update-campesena-obligacione.dto';

@Controller('campesena-obligaciones')
export class CampesenaObligacionesController {
  constructor(private readonly campesenaObligacionesService: CampesenaObligacionesService) {}

  @Post()
  create(@Body() createCampesenaObligacioneDto: CreateCampesenaObligacioneDto) {
    return this.campesenaObligacionesService.create(createCampesenaObligacioneDto);
  }

  @Get()
  findAll() {
    return this.campesenaObligacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campesenaObligacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampesenaObligacioneDto: UpdateCampesenaObligacioneDto) {
    return this.campesenaObligacionesService.update(+id, updateCampesenaObligacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campesenaObligacionesService.remove(+id);
  }
}
