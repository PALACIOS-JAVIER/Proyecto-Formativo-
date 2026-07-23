import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from './entities/sede.entity';
import { CreateSedeDto } from './dto/create-sede.dto';
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
        return await this.sedeRepository.save(nuevaSede);
    }

    async findAll(): Promise<Sede[]> {
        return await this.sedeRepository.find();
    }

    // Endpoint clave para el Frontend: Filtra los roles por el ID de la sede
    async findRolesBySede(id_sede: number): Promise<Rol[]> {
        const sede = await this.sedeRepository.findOne({ where: { id_sede } });
        if (!sede) {
            throw new NotFoundException(`La sede con ID ${id_sede} no existe`);
        }
        
        return await this.rolRepository.find({
            where: { sede: { id_sede } }
        });
    }
}
