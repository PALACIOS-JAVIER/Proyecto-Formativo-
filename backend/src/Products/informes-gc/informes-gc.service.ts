import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGC } from './entities/informe-gc.entity';
import { ObservacionGC } from './entities/observacion-gc.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Notificacion } from '../notificaciones/entities/notificacione.entity';

@Injectable()
export class InformesGcService {
  constructor(
    @InjectRepository(InformeGC)
    private readonly informeGcRepository: Repository<InformeGC>,
    @InjectRepository(ObservacionGC)
    private readonly observacionGcRepository: Repository<ObservacionGC>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async createWithFile(dto: { mes: string; anio: number; id_usuario: number; archivo_url: string }): Promise<InformeGC> {
    const usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: dto.id_usuario } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${dto.id_usuario} no encontrado`);
    }

    const informe = this.informeGcRepository.create({
      mes: dto.mes,
      anio: Number(dto.anio),
      estado: 'revisando', // 'aprobado', 'correccion', 'revisando'
      archivo_url: dto.archivo_url,
      usuario,
    });

    return this.informeGcRepository.save(informe);
  }

  async findAll(): Promise<InformeGC[]> {
    return this.informeGcRepository.find({
      relations: {
        usuario: { area: true, sede: true, rol: true },
        observaciones: true,
      },
      order: { id_informe_gc: 'DESC' },
    });
  }

  async findByUsuario(usuarioId: number): Promise<InformeGC[]> {
    return this.informeGcRepository.find({
      where: { usuario: { id_Usuario: usuarioId } },
      relations: {
        usuario: true,
        observaciones: true,
      },
      order: { id_informe_gc: 'DESC' },
    });
  }

  async findOne(id: number): Promise<InformeGC> {
    const informe = await this.informeGcRepository.findOne({
      where: { id_informe_gc: id },
      relations: {
        usuario: { area: true, sede: true, rol: true },
        observaciones: true,
      },
    });

    if (!informe) {
      throw new NotFoundException(`Informe GC con ID ${id} no encontrado`);
    }

    return informe;
  }

  async updateEstado(id: number, estado: string): Promise<InformeGC> {
    const informe = await this.findOne(id);
    informe.estado = estado;
    return this.informeGcRepository.save(informe);
  }

  async addObservacion(id: number, comentario: string, coordinadorId?: number): Promise<ObservacionGC> {
    const informe = await this.findOne(id);

    let coordinador: Usuario | null = null;
    if (coordinadorId) {
      coordinador = await this.usuarioRepository.findOne({ where: { id_Usuario: coordinadorId } });
    }

    const observacion = this.observacionGcRepository.create({
      comentario,
      informe_gc: informe,
      coordinador: coordinador || undefined,
    });

    informe.estado = 'correccion';
    await this.informeGcRepository.save(informe);

    // Create automatic alert notification for the instructor
    if (informe.usuario) {
      const notif = this.notificacionRepository.create({
        titulo: `⚠️ Corrección requerida en Informe GC (${informe.mes} ${informe.anio})`,
        descripcion: `El coordinador solicitó corregir tu informe GC: "${comentario}"`,
        tipo: 'observation',
        is_new: true,
        usuario_destino: informe.usuario,
        usuario_origen: coordinador || undefined,
      });
      await this.notificacionRepository.save(notif);
    }

    return this.observacionGcRepository.save(observacion);
  }

  async remove(id: number): Promise<void> {
    const informe = await this.findOne(id);
    await this.informeGcRepository.remove(informe);
  }
}
