import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ObjetoContractualService } from './objeto-contractual.service';
import { CreateObjetoContractualDto } from './dto/create-objeto-contractual.dto';
import { UpdateObjetoContractualDto } from './dto/update-objeto-contractual.dto';

@Controller('objeto-contractual')
export class ObjetoContractualController {
  constructor(private readonly objetoContractualService: ObjetoContractualService) {}

  @Post()
  create(@Body() createObjetoContractualDto: CreateObjetoContractualDto) {
    return this.objetoContractualService.create(createObjetoContractualDto);
  }

  @Get()
  findAll() {
    return this.objetoContractualService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objetoContractualService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObjetoContractualDto: UpdateObjetoContractualDto) {
    return this.objetoContractualService.update(+id, updateObjetoContractualDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objetoContractualService.remove(+id);
  }
}
