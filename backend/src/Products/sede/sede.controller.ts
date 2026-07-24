import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SedesService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';

@Controller('sedes')
export class SedesController {
    constructor(private readonly sedesService: SedesService) {}

    @Post()
    create(@Body() createSedeDto: CreateSedeDto) {
        return this.sedesService.create(createSedeDto);
    }

    @Get()
    findAll() {
        return this.sedesService.findAll();
    }

    // Ruta que consumirá tu frontend al cambiar el select de Sede
    @Get(':id_sede/roles')
    findRoles(@Param('id_sede', ParseIntPipe) id_sede: number) {
        return this.sedesService.findRolesBySede(id_sede);
    }
}
