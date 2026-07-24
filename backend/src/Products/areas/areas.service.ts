import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';
import { Rol } from '../rol/entities/rol.entity';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<Area> {
    const rol = await this.rolRepository.findOne({ where: { id_rol: createAreaDto.id_rol } });
    if (!rol) {
      throw new NotFoundException(`El rol con ID ${createAreaDto.id_rol} no existe`);
    }

    const nuevaArea = this.areaRepository.create({
      nombre: createAreaDto.nombre,
      rol,
    });

    return this.areaRepository.save(nuevaArea);
  }

  async findAll(): Promise<Area[]> {
    return this.areaRepository.find({ relations: { rol: true, objetos: true } });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areaRepository.findOne({ where: { id_area: id }, relations: { rol: true, objetos: true } });
    if (!area) {
      throw new NotFoundException(`El área con ID ${id} no existe`);
    }
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);
    if (updateAreaDto.id_rol) {
      const rol = await this.rolRepository.findOne({ where: { id_rol: updateAreaDto.id_rol } });
      if (!rol) {
        throw new NotFoundException(`El rol con ID ${updateAreaDto.id_rol} no existe`);
      }
      area.rol = rol;
    }
    Object.assign(area, updateAreaDto);
    return this.areaRepository.save(area);
  }

  async remove(id: number): Promise<void> {
    const area = await this.findOne(id);
    await this.areaRepository.remove(area);
  }
}
