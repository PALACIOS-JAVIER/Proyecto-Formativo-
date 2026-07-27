import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegularFicObligacionesService } from './regular-fic-obligaciones.service';
import { CreateRegularFicObligacioneDto } from './dto/create-regular-fic-obligacione.dto';
import { UpdateRegularFicObligacioneDto } from './dto/update-regular-fic-obligacione.dto';

@Controller('regular-fic-obligaciones')
export class RegularFicObligacionesController {
  constructor(private readonly regularFicObligacionesService: RegularFicObligacionesService) {}

  @Post()
  create(@Body() createRegularFicObligacioneDto: CreateRegularFicObligacioneDto) {
    return this.regularFicObligacionesService.create(createRegularFicObligacioneDto);
  }

  @Get()
  findAll() {
    return this.regularFicObligacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regularFicObligacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegularFicObligacioneDto: UpdateRegularFicObligacioneDto) {
    return this.regularFicObligacionesService.update(+id, updateRegularFicObligacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regularFicObligacionesService.remove(+id);
  }
}
