import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { Sede } from '../sede/entities/sede.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
        @InjectRepository(Sede)
        private readonly sedeRepository: Repository<Sede>,
    ) {}

    async create(createRolDto: CreateRolDto): Promise<Rol> {
        // 1. Validar que la sede asignada realmente exista
        const sede = await this.sedeRepository.findOne({ where: { id_sede: createRolDto.id_sede } });
        if (!sede) {
            throw new NotFoundException(`La sede con ID ${createRolDto.id_sede} no existe`);
        }

        // 2. Crear el objeto asignando la relación completa
        const nuevoRol = this.rolRepository.create({
            nombre: createRolDto.nombre,
            sede: sede // Pasamos la entidad Sede completa para establecer la Foreign Key
        });

        return await this.rolRepository.save(nuevoRol);
    }

    async findAll(): Promise<Rol[]> {
        // relations: { sede: true } incluye los datos de la sede en la respuesta JSON
        return await this.rolRepository.find({ relations: { sede: true } });
    }
}
