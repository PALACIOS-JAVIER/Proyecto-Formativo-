import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGF } from './entities/informe-gf.entity';
import { ObservacionGF } from './entities/observacion-gf.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Notificacion } from '../notificaciones/entities/notificacione.entity';

@Injectable()
export class InformesGfService {
  constructor(
    @InjectRepository(InformeGF)
    private readonly informeGfRepository: Repository<InformeGF>,
    @InjectRepository(ObservacionGF)
    private readonly observacionGfRepository: Repository<ObservacionGF>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async createWithFile(dto: { mes: string; anio: number; id_usuario: number; archivo_url: string }): Promise<InformeGF> {
    const usuario = await this.usuarioRepository.findOne({ where: { id_Usuario: dto.id_usuario } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${dto.id_usuario} no encontrado`);
    }

    const informe = this.informeGfRepository.create({
      mes: dto.mes,
      anio: Number(dto.anio),
      estado: 'revisando',
      archivo_url: dto.archivo_url,
      usuario,
    });

    return this.informeGfRepository.save(informe);
  }

  async findAll(): Promise<InformeGF[]> {
    return this.informeGfRepository.find({
      relations: {
        usuario: { area: true, sede: true, rol: true },
        observaciones: true,
      },
      order: { id_informe_gf: 'DESC' },
    });
  }

  async findByUsuario(usuarioId: number): Promise<InformeGF[]> {
    return this.informeGfRepository.find({
      where: { usuario: { id_Usuario: usuarioId } },
      relations: {
        usuario: true,
        observaciones: true,
      },
      order: { id_informe_gf: 'DESC' },
    });
  }

  async findOne(id: number): Promise<InformeGF> {
    const informe = await this.informeGfRepository.findOne({
      where: { id_informe_gf: id },
      relations: {
        usuario: { area: true, sede: true, rol: true },
        observaciones: true,
      },
    });

    if (!informe) {
      throw new NotFoundException(`Informe GF con ID ${id} no encontrado`);
    }

    return informe;
  }

  async updateEstado(id: number, estado: string): Promise<InformeGF> {
    const informe = await this.findOne(id);
    informe.estado = estado;
    return this.informeGfRepository.save(informe);
  }

  async addObservacion(id: number, comentario: string, coordinadorId?: number): Promise<ObservacionGF> {
    const informe = await this.findOne(id);

    let coordinador: Usuario | null = null;
    if (coordinadorId) {
      coordinador = await this.usuarioRepository.findOne({ where: { id_Usuario: coordinadorId } });
    }

    const observacion = this.observacionGfRepository.create({
      comentario,
      informe_gf: informe,
      coordinador: coordinador || undefined,
    });

    informe.estado = 'correccion';
    await this.informeGfRepository.save(informe);

    // Create automatic alert notification for the instructor
    if (informe.usuario) {
      const notif = this.notificacionRepository.create({
        titulo: `⚠️ Corrección requerida en Informe GF (${informe.mes} ${informe.anio})`,
        descripcion: `El coordinador solicitó corregir tu informe GF: "${comentario}"`,
        tipo: 'observation',
        is_new: true,
        usuario_destino: informe.usuario,
        usuario_origen: coordinador || undefined,
      });
      await this.notificacionRepository.save(notif);
    }

    return this.observacionGfRepository.save(observacion);
  }

  async remove(id: number): Promise<void> {
    const informe = await this.findOne(id);
    await this.informeGfRepository.remove(informe);
  }
}
