import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { Especialidad } from './entities/especialidad.entity';
import { Area } from '../areas/entities/area.entity';

@Injectable()
export class EspecialidadService {
  constructor(
    @InjectRepository(Especialidad)
    private readonly especialidadRepository: Repository<Especialidad>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(dto: CreateEspecialidadDto): Promise<Especialidad> {
    const area = await this.areaRepository.findOne({ where: { id_area: dto.id_area } });
    if (!area) throw new NotFoundException(`Área con ID ${dto.id_area} no encontrada`);

    const especialidad = this.especialidadRepository.create({ nombre: dto.nombre, area });
    return this.especialidadRepository.save(especialidad);
  }

  async findAll(): Promise<Especialidad[]> {
    return this.especialidadRepository.find({ relations: { area: true } });
  }

  async findByArea(id_area: number): Promise<Especialidad[]> {
    return this.especialidadRepository.find({
      where: { area: { id_area } },
      relations: { area: true },
    });
  }

  async findOne(id: number): Promise<Especialidad> {
    const esp = await this.especialidadRepository.findOne({
      where: { id_especialidad: id },
      relations: { area: true, objetos: true },
    });
    if (!esp) throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    return esp;
  }

  async update(id: number, dto: UpdateEspecialidadDto): Promise<Especialidad> {
    const esp = await this.findOne(id);
    if (dto.id_area) {
      const area = await this.areaRepository.findOne({ where: { id_area: dto.id_area } });
      if (!area) throw new NotFoundException(`Área con ID ${dto.id_area} no encontrada`);
      esp.area = area;
    }
    if (dto.nombre) esp.nombre = dto.nombre;
    return this.especialidadRepository.save(esp);
  }

  async remove(id: number): Promise<void> {
    const esp = await this.findOne(id);
    await this.especialidadRepository.remove(esp);
  }
}
