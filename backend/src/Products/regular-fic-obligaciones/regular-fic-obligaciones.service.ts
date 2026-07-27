import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRegularFicObligacioneDto } from './dto/create-regular-fic-obligacione.dto';
import { UpdateRegularFicObligacioneDto } from './dto/update-regular-fic-obligacione.dto';
import { RegularFicObligacione } from './entities/regular-fic-obligacione.entity';

@Injectable()
export class RegularFicObligacionesService {
  constructor(
    @InjectRepository(RegularFicObligacione)
    private readonly repository: Repository<RegularFicObligacione>,
  ) {}

  create(dto: CreateRegularFicObligacioneDto) {
    const nueva = this.repository.create(dto);
    return this.repository.save(nueva);
  }

  findAll() {
    return this.repository.find({ order: { orden: 'ASC' } });
  }

  findActivas() {
    return this.repository.find({ where: { activa: true }, order: { orden: 'ASC' } });
  }

  async findOne(id: number) {
    const obligacion = await this.repository.findOne({ where: { id_obligacion: id } });
    if (!obligacion) throw new NotFoundException(`Obligación con ID ${id} no encontrada`);
    return obligacion;
  }

  async update(id: number, dto: UpdateRegularFicObligacioneDto) {
    const obligacion = await this.findOne(id);
    Object.assign(obligacion, dto);
    return this.repository.save(obligacion);
  }

  async remove(id: number) {
    const obligacion = await this.findOne(id);
    await this.repository.remove(obligacion);
  }
}
