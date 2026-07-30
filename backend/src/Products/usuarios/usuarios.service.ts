import { Injectable, NotFoundException } from '@nestjs/common';
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

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      sede,
      rol,
      area,
      password: createUsuarioDto.password,
    });

    return this.usuarioRepository.save(usuario);
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ relations: { sede: true, rol: true, area: true } });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: id }, relations: { sede: true, rol: true, area: true } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    let usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: id }, relations: { sede: true, rol: true, area: true } });
    if (!usuario && !isNaN(id)) {
      usuario = await this.usuarioRepository.findOne({ where: { cedula: id }, relations: { sede: true, rol: true, area: true } });
    }
    if (!usuario) {
      const all = await this.usuarioRepository.find({ relations: { sede: true, rol: true, area: true } });
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
