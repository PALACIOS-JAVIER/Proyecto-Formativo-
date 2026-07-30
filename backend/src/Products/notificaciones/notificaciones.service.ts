import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacione.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async createNotification(data: {
    titulo: string;
    descripcion: string;
    tipo: string;
    usuario_destino_id: number;
    usuario_origen_id?: number;
  }): Promise<Notificacion> {
    const usuarioDestino = await this.usuarioRepository.findOne({
      where: { id_Usuario: data.usuario_destino_id },
    });

    if (!usuarioDestino) return null as any;

    let usuarioOrigen: Usuario | null = null;
    if (data.usuario_origen_id) {
      usuarioOrigen = await this.usuarioRepository.findOne({
        where: { id_Usuario: data.usuario_origen_id },
      });
    }

    const notificacion = this.notificacionRepository.create({
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      is_new: true,
      usuario_destino: usuarioDestino,
      usuario_origen: usuarioOrigen || undefined,
    });

    return this.notificacionRepository.save(notificacion);
  }

  async findByUsuario(usuarioId: number): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { usuario_destino: { id_Usuario: usuarioId } },
      relations: { usuario_origen: true },
      order: { id_notificacion: 'DESC' },
    });
  }

  async marcarLeida(id: number): Promise<Notificacion> {
    const notif = await this.notificacionRepository.findOne({ where: { id_notificacion: id } });
    if (!notif) throw new NotFoundException(`Notificación ${id} no encontrada`);
    notif.is_new = false;
    return this.notificacionRepository.save(notif);
  }

  async remove(id: number): Promise<void> {
    const notif = await this.notificacionRepository.findOne({ where: { id_notificacion: id } });
    if (notif) await this.notificacionRepository.remove(notif);
  }
}
