import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordinador } from './entities/coordinador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateCoordinadorDto } from './dto/create-coordinador.dto';
import { UpdateCoordinadorDto } from './dto/update-coordinador.dto';

@Injectable()
export class CoordinadorService {
    constructor(
        @InjectRepository(Coordinador)
        private readonly coordinadorRepository: Repository<Coordinador>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async create(createCoordinadorDto: CreateCoordinadorDto): Promise<Coordinador> {
        try {
            // 1. Crear el usuario base para el coordinador
            const nuevoUsuario = this.usuarioRepository.create({
                nombre: createCoordinadorDto.nombre,
                apellido: createCoordinadorDto.apellido,
                cedula: createCoordinadorDto.cedula,
                telefono: createCoordinadorDto.telefono,
                correo: createCoordinadorDto.correo,
                password: createCoordinadorDto.password,
                rol: { id_rol: 3 }, // Asumimos id_rol 3 es Apoyo Administrativo / Coordinador
                sede: { id_sede: createCoordinadorDto.id_sede },
                estado_cuenta: 'aprobado' // Un coordinador creado directamente está aprobado
            });

            const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

            // 2. Crear el registro en coordinadores
            const nuevoCoordinador = this.coordinadorRepository.create({
                sede: { id_sede: createCoordinadorDto.id_sede },
                usuario: usuarioGuardado,
                anio_ejercicio: createCoordinadorDto.anio_ejercicio
            });
            return await this.coordinadorRepository.save(nuevoCoordinador);
        } catch (error) {
            if (error.code === '23505') { 
                throw new BadRequestException('La sede ya tiene un coordinador o la cédula/correo ya existen');
            }
            throw error;
        }
    }

    async findAll(): Promise<Coordinador[]> {
        return this.coordinadorRepository.find({ relations: { sede: true, usuario: true } });
    }

    async findOne(id: number): Promise<Coordinador> {
        const coordinador = await this.coordinadorRepository.findOne({ 
            where: { id_coordinador: id }, 
            relations: { sede: true, usuario: true } 
        });
        if (!coordinador) {
            throw new NotFoundException(`El coordinador con ID ${id} no existe`);
        }
        return coordinador;
    }

    async update(id: number, updateCoordinadorDto: UpdateCoordinadorDto): Promise<Coordinador> {
        const coordinador = await this.findOne(id);
        
        if (updateCoordinadorDto.id_sede) {
            coordinador.sede = { id_sede: updateCoordinadorDto.id_sede } as any;
        }
        if (updateCoordinadorDto.id_usuario) {
            coordinador.usuario = { id_Usuario: updateCoordinadorDto.id_usuario } as any;
        }

        try {
            return await this.coordinadorRepository.save(coordinador);
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('La sede especificada ya tiene un coordinador asignado');
            }
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const coordinador = await this.findOne(id);
        await this.coordinadorRepository.remove(coordinador);
    }
}
