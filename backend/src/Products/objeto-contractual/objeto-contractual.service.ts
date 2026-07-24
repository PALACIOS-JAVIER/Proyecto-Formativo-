import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateObjetoContractualDto } from './dto/create-objeto-contractual.dto';
import { UpdateObjetoContractualDto } from './dto/update-objeto-contractual.dto';
import { ObjetoContractual } from './entities/objeto-contractual.entity';
import { Area } from '../areas/entities/area.entity';

@Injectable()
export class ObjetoContractualService {
  constructor(
    @InjectRepository(ObjetoContractual)
    private readonly objetoRepository: Repository<ObjetoContractual>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(createObjetoContractualDto: CreateObjetoContractualDto): Promise<ObjetoContractual> {
    const area = await this.areaRepository.findOne({ where: { id_area: createObjetoContractualDto.id_area } });
    if (!area) {
      throw new NotFoundException(`El área con ID ${createObjetoContractualDto.id_area} no existe`);
    }

    const newObjeto = this.objetoRepository.create({
      descripcion: createObjetoContractualDto.descripcion,
      area,
    });

    return this.objetoRepository.save(newObjeto);
  }

  async findAll(): Promise<ObjetoContractual[]> {
    return this.objetoRepository.find({ relations: { area: true } });
  }

  async findOne(id: number): Promise<ObjetoContractual> {
    const objeto = await this.objetoRepository.findOne({ where: { id_objeto: id }, relations: { area: true } });
    if (!objeto) {
      throw new NotFoundException(`El objeto contractual con ID ${id} no existe`);
    }
    return objeto;
  }

  async update(id: number, updateObjetoContractualDto: UpdateObjetoContractualDto): Promise<ObjetoContractual> {
    const objeto = await this.findOne(id);
    if (updateObjetoContractualDto.id_area) {
      const area = await this.areaRepository.findOne({ where: { id_area: updateObjetoContractualDto.id_area } });
      if (!area) {
        throw new NotFoundException(`El área con ID ${updateObjetoContractualDto.id_area} no existe`);
      }
      objeto.area = area;
    }
    Object.assign(objeto, updateObjetoContractualDto);
    return this.objetoRepository.save(objeto);
  }

  async remove(id: number): Promise<void> {
    const objeto = await this.findOne(id);
    await this.objetoRepository.remove(objeto);
  }
}
