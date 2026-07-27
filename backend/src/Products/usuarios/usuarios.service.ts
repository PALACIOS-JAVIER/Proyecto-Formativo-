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
    const sede = await this.sedeRepository.findOne({ where: { id_sede: Number(createUsuarioDto.id_sede) } });
    const rol = await this.rolRepository.findOne({ where: { id_rol: Number(createUsuarioDto.id_rol) } });
    const area = await this.areaRepository.findOne({ where: { id_area: Number(createUsuarioDto.id_area) } });

    if (!sede || !rol || !area) {
      throw new NotFoundException('Sede, rol o área no encontrados');
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
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.id_sede) {
      const sede = await this.sedeRepository.findOne({ where: { id_sede: Number(updateUsuarioDto.id_sede) } });
      if (!sede) throw new NotFoundException(`Sede con id ${updateUsuarioDto.id_sede} no encontrada`);
      usuario.sede = sede;
    }

    if (updateUsuarioDto.id_rol) {
      const rol = await this.rolRepository.findOne({ where: { id_rol: Number(updateUsuarioDto.id_rol) } });
      if (!rol) throw new NotFoundException(`Rol con id ${updateUsuarioDto.id_rol} no encontrado`);
      usuario.rol = rol;
    }

    if (updateUsuarioDto.id_area) {
      const area = await this.areaRepository.findOne({ where: { id_area: Number(updateUsuarioDto.id_area) } });
      if (!area) throw new NotFoundException(`Área con id ${updateUsuarioDto.id_area} no encontrada`);
      usuario.area = area;
    }

    Object.assign(usuario, updateUsuarioDto);
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
