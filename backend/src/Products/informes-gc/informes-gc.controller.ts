import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformesGcService } from './informes-gc.service';
import { CreateInformesGcDto } from './dto/create-informes-gc.dto';
import { UpdateInformesGcDto } from './dto/update-informes-gc.dto';

@Controller('informes-gc')
export class InformesGcController {
  constructor(private readonly informesGcService: InformesGcService) {}

  @Post()
  create(@Body() createInformesGcDto: CreateInformesGcDto) {
    return this.informesGcService.create(createInformesGcDto);
  }

  @Get()
  findAll() {
    return this.informesGcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesGcService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformesGcDto: UpdateInformesGcDto) {
    return this.informesGcService.update(+id, updateInformesGcDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesGcService.remove(+id);
  }
}
