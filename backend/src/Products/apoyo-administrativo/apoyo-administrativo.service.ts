import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApoyoAdministrativo } from './entities/apoyo-administrativo.entity';
import { Coordinador } from '../coordinadores/entities/coordinador.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Sede } from '../sede/entities/sede.entity';
import { Area } from '../areas/entities/area.entity';
import { CreateApoyoAdministrativoDto } from './dto/create-apoyo-administrativo.dto';

@Injectable()
export class ApoyoAdministrativoService {
  constructor(
    @InjectRepository(ApoyoAdministrativo)
    private readonly apoyoRepository: Repository<ApoyoAdministrativo>,
    @InjectRepository(Coordinador)
    private readonly coordinadorRepository: Repository<Coordinador>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(dto: CreateApoyoAdministrativoDto, coordinatorUserId?: number): Promise<ApoyoAdministrativo> {
    const existingUser = await this.usuarioRepository.findOne({
      where: [{ correo: dto.correo }, { cedula: dto.cedula }],
    });
    if (existingUser) {
      throw new BadRequestException('El usuario con este correo o cédula ya existe');
    }

    let sede = await this.sedeRepository.findOne({ where: { id_sede: 1 } });
    if (!sede) {
      sede = await this.sedeRepository.save(this.sedeRepository.create({ nombre: 'Yamboro' }));
    }

    let rol = await this.rolRepository.findOne({ where: { nombre: 'Apoyo Administrativo' } });
    if (!rol) {
      rol = await this.rolRepository.save(this.rolRepository.create({ nombre: 'Apoyo Administrativo', sede }));
    }

    let area = await this.areaRepository.findOne({ where: { id_area: 1 } });
    if (!area) {
      area = await this.areaRepository.save(this.areaRepository.create({ nombre: 'Apoyo administrativo', rol }));
    }

    // Crear el usuario con estado aprobado (sin exigencia de datos contractuales)
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      cedula: dto.cedula,
      telefono: dto.telefono,
      correo: dto.correo,
      password: dto.password || '123456',
      estado_cuenta: 'aprobado',
      sede,
      rol,
      area,
    });
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

    // Buscar el coordinador vinculante
    const userIdToSearch = dto.id_coordinador_usuario || coordinatorUserId;
    let coordinador: Coordinador | null = null;
    if (userIdToSearch) {
      coordinador = await this.coordinadorRepository.findOne({
        where: { usuario: { id_Usuario: userIdToSearch } },
      });
    }

    if (!coordinador) {
      // Buscar cualquier coordinador existente o crear uno por defecto para la sede
      coordinador = await this.coordinadorRepository.findOne({ where: { sede: { id_sede: sede.id_sede } } });
      if (!coordinador) {
        // Encontrar primer usuario admin o asignar como coordinador
        const adminUser = await this.usuarioRepository.findOne({ where: { correo: 'admin@sena.edu.co' } });
        if (adminUser) {
          coordinador = await this.coordinadorRepository.save(
            this.coordinadorRepository.create({ usuario: adminUser, sede, anio_ejercicio: 2026 })
          );
        }
      }
    }

    if (!coordinador) {
      // Crear registro dummy si no se encuentra ninguno
      coordinador = await this.coordinadorRepository.save(
        this.coordinadorRepository.create({ usuario: usuarioGuardado, sede, anio_ejercicio: 2026 })
      );
    }

    const nuevoApoyo = this.apoyoRepository.create({
      usuario: usuarioGuardado,
      coordinador,
    });

    return this.apoyoRepository.save(nuevoApoyo);
  }

  async findAll(): Promise<ApoyoAdministrativo[]> {
    return this.apoyoRepository.find();
  }

  async findOne(id: number): Promise<ApoyoAdministrativo> {
    const apoyo = await this.apoyoRepository.findOne({ where: { id_apoyo: id } });
    if (!apoyo) throw new NotFoundException(`Apoyo administrativo con ID ${id} no encontrado`);
    return apoyo;
  }

  async remove(id: number): Promise<void> {
    const apoyo = await this.findOne(id);
    await this.apoyoRepository.remove(apoyo);
  }
}
