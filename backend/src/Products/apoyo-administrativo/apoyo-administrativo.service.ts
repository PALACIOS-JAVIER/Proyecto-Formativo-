import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApoyoAdministrativo } from './entities/apoyo-administrativo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { CreateApoyoAdministrativoDto } from './dto/create-apoyo-administrativo.dto';
import { UpdateApoyoAdministrativoDto } from './dto/update-apoyo-administrativo.dto';

@Injectable()
export class ApoyoAdministrativoService {
    constructor(
        @InjectRepository(ApoyoAdministrativo)
        private readonly apoyoRepository: Repository<ApoyoAdministrativo>,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        @InjectRepository(Coordinador)
        private readonly coordinadorRepository: Repository<Coordinador>,
    ) {}

    async create(createApoyoDto: CreateApoyoAdministrativoDto): Promise<ApoyoAdministrativo> {
        try {
            // Verificar que el coordinador existe usando el id_usuario
            const coordinador = await this.coordinadorRepository.findOne({
                where: { usuario: { id_Usuario: createApoyoDto.id_usuario } },
                relations: ['sede']
            });

            if (!coordinador) {
                throw new NotFoundException(`El coordinador con ID de usuario ${createApoyoDto.id_usuario} no existe`);
            }

            // 1. Crear el usuario base para el apoyo administrativo
            const nuevoUsuario = this.usuarioRepository.create({
                nombre: createApoyoDto.nombre,
                apellido: createApoyoDto.apellido,
                cedula: createApoyoDto.cedula,
                telefono: createApoyoDto.telefono,
                correo: createApoyoDto.correo,
                password: createApoyoDto.password,
                rol: { id_rol: 3 }, // 3 = Apoyo Administrativo
                sede: { id_sede: coordinador.sede.id_sede },
                estado_cuenta: 'aprobado'
            });

            const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

            // 2. Crear el registro en apoyos_administrativos
            const nuevoApoyo = this.apoyoRepository.create({
                coordinador: { id_coordinador: coordinador.id_coordinador },
                usuario: usuarioGuardado
            });
            return await this.apoyoRepository.save(nuevoApoyo);
        } catch (error) {
            if (error.code === '23505') { 
                throw new BadRequestException('El usuario ya existe o la cédula/correo están duplicados');
            }
            throw error;
        }
    }

    async findAll(): Promise<ApoyoAdministrativo[]> {
        return this.apoyoRepository.find({ relations: { coordinador: true, usuario: true } });
    }

    async findOne(id: number): Promise<ApoyoAdministrativo> {
        const apoyo = await this.apoyoRepository.findOne({ 
            where: { id_apoyo: id }, 
            relations: { coordinador: true, usuario: true } 
        });
        if (!apoyo) {
            throw new NotFoundException(`El apoyo administrativo con ID ${id} no existe`);
        }
        return apoyo;
    }

    async update(id: number, updateApoyoDto: UpdateApoyoAdministrativoDto): Promise<ApoyoAdministrativo> {
        const apoyo = await this.findOne(id);
        
        if (updateApoyoDto.id_coordinador) {
            apoyo.coordinador = { id_coordinador: updateApoyoDto.id_coordinador } as any;
        }

        try {
            return await this.apoyoRepository.save(apoyo);
        } catch (error) {
            throw error;
        }
    }

    async remove(id: number): Promise<void> {
        const apoyo = await this.findOne(id);
        await this.apoyoRepository.remove(apoyo);
    }
}
