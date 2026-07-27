import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { Historial } from './entities/historial.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto) {
    const coordinador = await this.usuarioRepository.findOneBy({ id_Usuario: createHistorialDto.id_coordinador });
    if (!coordinador) throw new NotFoundException('Coordinador no encontrado');

    let instructor_afectado = null;
    if (createHistorialDto.id_instructor) {
      instructor_afectado = await this.usuarioRepository.findOneBy({ id_Usuario: createHistorialDto.id_instructor });
    }

    const nuevoHistorial = this.historialRepository.create({
      accion: createHistorialDto.accion,
      detalles: createHistorialDto.detalles,
      coordinador,
      instructor_afectado: instructor_afectado,
    });

    return this.historialRepository.save(nuevoHistorial);
  }

  findAll() {
    return this.historialRepository.find({
      order: { fecha: 'DESC' },
      relations: { coordinador: true, instructor_afectado: true },
    });
  }

  async findOne(id: number) {
    const historial = await this.historialRepository.findOne({
      where: { id_historial: id },
      relations: { coordinador: true, instructor_afectado: true },
    });
    if (!historial) throw new NotFoundException(`Historial #${id} no encontrado`);
    return historial;
  }

  update(id: number, updateHistorialDto: UpdateHistorialDto) {
    // Historial logs generally shouldn't be updated, but keeping the method structure
    return `This action updates a #${id} historial (Not Recommended)`;
  }

  remove(id: number) {
    // Similarly, logs shouldn't be easily removed
    return `This action removes a #${id} historial`;
  }
}

