import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApoyoAdministrativoService } from './apoyo-administrativo.service';
import { CreateApoyoAdministrativoDto } from './dto/create-apoyo-administrativo.dto';
import { UpdateApoyoAdministrativoDto } from './dto/update-apoyo-administrativo.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('apoyos-administrativos')
export class ApoyoAdministrativoController {
    constructor(private readonly apoyoService: ApoyoAdministrativoService) {}

    @Post()
    create(@Body() createApoyoDto: CreateApoyoAdministrativoDto) {
        return this.apoyoService.create(createApoyoDto);
    }

    @Get()
    findAll() {
        return this.apoyoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.apoyoService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateApoyoDto: UpdateApoyoAdministrativoDto) {
        return this.apoyoService.update(id, updateApoyoDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.apoyoService.remove(id);
    }
}
