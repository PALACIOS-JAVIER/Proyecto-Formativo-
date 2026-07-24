import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { SedesService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

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

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sedesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateSedeDto: UpdateSedeDto) {
        return this.sedesService.update(id, updateSedeDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sedesService.remove(id);
    }

    @Get(':id_sede/roles')
    findRoles(@Param('id_sede', ParseIntPipe) id_sede: number) {
        return this.sedesService.findRolesBySede(id_sede);
    }
}
