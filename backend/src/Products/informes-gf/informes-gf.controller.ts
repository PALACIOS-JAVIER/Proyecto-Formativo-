import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformesGfService } from './informes-gf.service';
import { CreateInformesGfDto } from './dto/create-informes-gf.dto';
import { UpdateInformesGfDto } from './dto/update-informes-gf.dto';

@Controller('informes-gf')
export class InformesGfController {
  constructor(private readonly informesGfService: InformesGfService) {}

  @Post()
  create(@Body() createInformesGfDto: CreateInformesGfDto) {
    return this.informesGfService.create(createInformesGfDto);
  }

  @Get()
  findAll() {
    return this.informesGfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesGfService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformesGfDto: UpdateInformesGfDto) {
    return this.informesGfService.update(+id, updateInformesGfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesGfService.remove(+id);
  }
}
