import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Sede } from '../sede/entities/sede.entity';
import { Rol } from '../rol/entities/rol.entity';
import { Area } from '../areas/entities/area.entity';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existente = await this.usuarioRepository.findOne({
      where: [
        { correo: createUsuarioDto.correo },
        { cedula: Number(createUsuarioDto.cedula) },
        { telefono: Number(createUsuarioDto.telefono) },
      ],
    });

    if (existente) {
      if (existente.correo === createUsuarioDto.correo) {
        throw new ConflictException('Ya existe un usuario registrado con este correo institucional.');
      }
      if (Number(existente.cedula) === Number(createUsuarioDto.cedula)) {
        throw new ConflictException('Ya existe un usuario registrado con esta cédula de ciudadanía.');
      }
      if (Number(existente.telefono) === Number(createUsuarioDto.telefono)) {
        throw new ConflictException('Ya existe un usuario registrado con este número de teléfono.');
      }
      throw new ConflictException('El usuario, correo, cédula o teléfono ya se encuentra registrado en el sistema.');
    }

    const sedeIdNum = Number(createUsuarioDto.id_sede);
    let sede = !isNaN(sedeIdNum)
      ? await this.sedeRepository.findOne({ where: { id_sede: sedeIdNum } })
      : await this.sedeRepository.findOne({ where: { nombre: createUsuarioDto.id_sede } });

    if (!sede) {
      sede = await this.sedeRepository.save(
        this.sedeRepository.create({ nombre: createUsuarioDto.id_sede || 'Yamboro' })
      );
    }

    const rolIdNum = Number(createUsuarioDto.id_rol);
    let rol = !isNaN(rolIdNum)
      ? await this.rolRepository.findOne({ where: { id_rol: rolIdNum } })
      : await this.rolRepository.findOne({ where: { nombre: createUsuarioDto.id_rol } });

    if (!rol) {
      rol = await this.rolRepository.save(
        this.rolRepository.create({ nombre: createUsuarioDto.id_rol || 'campesena', sede })
      );
    }

    const areaIdNum = Number(createUsuarioDto.id_area);
    let area = !isNaN(areaIdNum)
      ? await this.areaRepository.findOne({ where: { id_area: areaIdNum } })
      : await this.areaRepository.findOne({ where: { nombre: createUsuarioDto.id_area } });

    if (!area) {
      area = await this.areaRepository.save(
        this.areaRepository.create({ nombre: createUsuarioDto.id_area || 'General', rol })
      );
    }

    const dto: any = { ...createUsuarioDto };
    delete dto.id_sede;
    delete dto.id_rol;
    delete dto.id_area;
    delete dto.passwordConfirm;

    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuario: Usuario = this.usuarioRepository.create({
        ...dto,
        sede,
        rol,
        area,
        password: hashedPassword,
      } as any) as unknown as Usuario;
      return (await this.usuarioRepository.save(usuario as any)) as unknown as Usuario;
    } catch (error: any) {
      console.error('Error en base de datos al guardar usuario:', error);
      throw new BadRequestException(`No se pudo registrar el usuario: ${error.message || error}`);
    }
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ relations: { sede: true, rol: true, area: true, especialidad: true, objetoContractual: true } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: id }, relations: { sede: true, rol: true, area: true, especialidad: true, objetoContractual: true } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    let usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: id }, relations: { sede: true, rol: true, area: true, especialidad: true, objetoContractual: true } });
    if (!usuario && !isNaN(id)) {
      usuario = await this.usuarioRepository.findOne({ where: { cedula: id }, relations: { sede: true, rol: true, area: true, especialidad: true, objetoContractual: true } });
    }
    if (!usuario) {
      const all = await this.usuarioRepository.find({ relations: { sede: true, rol: true, area: true, especialidad: true, objetoContractual: true } });
      if (all.length > 0) {
        usuario = all.find(u => u.id_Usuario === id || u.cedula?.toString() === id.toString()) || all[0];
      }
    }
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const dto = { ...updateUsuarioDto };

    if (dto.id_sede) {
      const sedeIdNum = Number(dto.id_sede);
      let sede = !isNaN(sedeIdNum)
        ? await this.sedeRepository.findOne({ where: { id_sede: sedeIdNum } })
        : await this.sedeRepository.findOne({ where: { nombre: dto.id_sede } });
      if (sede) usuario.sede = sede;
      delete (dto as any).id_sede;
    }

    if (dto.id_rol) {
      const rolIdNum = Number(dto.id_rol);
      let rol = !isNaN(rolIdNum)
        ? await this.rolRepository.findOne({ where: { id_rol: rolIdNum } })
        : await this.rolRepository.findOne({ where: { nombre: dto.id_rol } });
      if (rol) usuario.rol = rol;
      delete (dto as any).id_rol;
    }

    if (dto.id_area) {
      const areaIdNum = Number(dto.id_area);
      let area = !isNaN(areaIdNum)
        ? await this.areaRepository.findOne({ where: { id_area: areaIdNum } })
        : await this.areaRepository.findOne({ where: { nombre: dto.id_area } });
      if (area) usuario.area = area;
      delete (dto as any).id_area;
    }

    if (dto.id_especialidad) {
      usuario.especialidad = { id_especialidad: dto.id_especialidad } as any;
      delete (dto as any).id_especialidad;
    }

    if (dto.id_objeto) {
      usuario.objetoContractual = { id_objeto: dto.id_objeto } as any;
      delete (dto as any).id_objeto;
    }

    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async updateFiles(id: number, data: { fotoPerfil?: string; firma?: string }): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (data.fotoPerfil && usuario.fotoPerfil) {
      const oldPath = join(process.cwd(), usuario.fotoPerfil);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    if (data.firma && usuario.firma) {
      const oldPath = join(process.cwd(), usuario.firma);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    if (data.fotoPerfil) usuario.fotoPerfil = data.fotoPerfil;
    if (data.firma) usuario.firma = data.firma;

    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    if (usuario.fotoPerfil && existsSync(join(process.cwd(), usuario.fotoPerfil))) {
      unlinkSync(join(process.cwd(), usuario.fotoPerfil));
    }
    if (usuario.firma && existsSync(join(process.cwd(), usuario.firma))) {
      unlinkSync(join(process.cwd(), usuario.firma));
    }
    await this.usuarioRepository.remove(usuario);
  }
}
