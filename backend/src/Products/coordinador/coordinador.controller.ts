import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { CoordinadorService } from './coordinador.service';
import { CreateCoordinadorDto } from './dto/create-coordinador.dto';
import { UpdateCoordinadorDto } from './dto/update-coordinador.dto';

@Controller('coordinadores')
export class CoordinadorController {
    constructor(private readonly coordinadorService: CoordinadorService) {}

    @Post()
    create(@Body() createCoordinadorDto: CreateCoordinadorDto) {
        return this.coordinadorService.create(createCoordinadorDto);
    }

    @Get()
    findAll() {
        return this.coordinadorService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coordinadorService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCoordinadorDto: UpdateCoordinadorDto) {
        return this.coordinadorService.update(id, updateCoordinadorDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.coordinadorService.remove(id);
    }
}
