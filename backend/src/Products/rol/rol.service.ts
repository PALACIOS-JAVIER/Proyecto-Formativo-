import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
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
        const sede = await this.sedeRepository.findOne({ where: { id_sede: createRolDto.id_sede } });
        if (!sede) {
            throw new NotFoundException(`La sede con ID ${createRolDto.id_sede} no existe`);
        }

        const nuevoRol = this.rolRepository.create({
            nombre: createRolDto.nombre,
            sede,
        });

        return this.rolRepository.save(nuevoRol);
    }

    async findAll(): Promise<Rol[]> {
        return this.rolRepository.find({ relations: { sede: true, areas: true } });
    }

    async findOne(id: number): Promise<Rol> {
        const rol = await this.rolRepository.findOne({ where: { id_rol: id }, relations: { sede: true, areas: true } });
        if (!rol) {
            throw new NotFoundException(`El rol con ID ${id} no existe`);
        }
        return rol;
    }

    async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
        const rol = await this.findOne(id);
        if (updateRolDto.id_sede) {
            const sede = await this.sedeRepository.findOne({ where: { id_sede: updateRolDto.id_sede } });
            if (!sede) {
                throw new NotFoundException(`La sede con ID ${updateRolDto.id_sede} no existe`);
            }
            rol.sede = sede;
        }
        Object.assign(rol, updateRolDto);
        return this.rolRepository.save(rol);
    }

    async remove(id: number): Promise<void> {
        const rol = await this.findOne(id);
        await this.rolRepository.remove(rol);
    }
}
