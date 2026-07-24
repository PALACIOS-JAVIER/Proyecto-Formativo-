import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { Rol } from '../rol/entities/rol.entity';

@Injectable()
export class SedesService {
    constructor(
        @InjectRepository(Sede)
        private readonly sedeRepository: Repository<Sede>,
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
    ) {}

    async create(createSedeDto: CreateSedeDto): Promise<Sede> {
        const nuevaSede = this.sedeRepository.create(createSedeDto);
        return this.sedeRepository.save(nuevaSede);
    }

    async findAll(): Promise<Sede[]> {
        return this.sedeRepository.find({ relations: { roles: true } });
    }

    async findOne(id: number): Promise<Sede> {
        const sede = await this.sedeRepository.findOne({ where: { id_sede: id }, relations: { roles: true } });
        if (!sede) {
            throw new NotFoundException(`La sede con ID ${id} no existe`);
        }
        return sede;
    }

    async update(id: number, updateSedeDto: UpdateSedeDto): Promise<Sede> {
        const sede = await this.findOne(id);
        Object.assign(sede, updateSedeDto);
        return this.sedeRepository.save(sede);
    }

    async remove(id: number): Promise<void> {
        const sede = await this.findOne(id);
        await this.sedeRepository.remove(sede);
    }

    async findRolesBySede(id_sede: number): Promise<Rol[]> {
        const sede = await this.sedeRepository.findOne({ where: { id_sede } });
        if (!sede) {
            throw new NotFoundException(`La sede con ID ${id_sede} no existe`);
        }
        return this.rolRepository.find({
            where: { sede: { id_sede } },
            relations: { sede: true },
        });
    }
}
