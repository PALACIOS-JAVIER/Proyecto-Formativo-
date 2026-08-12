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

  async broadcastNotification(data: {
    titulo: string;
    descripcion: string;
    tipo: string;
    usuario_origen_id?: number;
  }): Promise<number> {
    let usuarioOrigen: Usuario | null = null;
    if (data.usuario_origen_id) {
      usuarioOrigen = await this.usuarioRepository.findOne({
        where: { id_Usuario: data.usuario_origen_id },
      });
    }

    const qb = this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where("rol.nombre NOT ILIKE '%coordinador%'")
      .andWhere("rol.nombre NOT ILIKE '%apoyo%'");
    
    const instructores = await qb.getMany();

    if (instructores.length === 0) return 0;

    const notificacionesToInsert = instructores.map(inst => {
      return this.notificacionRepository.create({
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        is_new: true,
        usuario_destino: inst,
        usuario_origen: usuarioOrigen || undefined,
      });
    });

    await this.notificacionRepository.save(notificacionesToInsert);
    return instructores.length;
  }

  async findBroadcastsByOrigen(usuarioId: number): Promise<Notificacion[]> {
    // Para no mostrar repetidas (N veces el mismo mensaje), traemos los distinct agrupando por titulo, descripcion y hora aprox
    const qb = this.notificacionRepository.createQueryBuilder('n')
      .select('n.titulo', 'titulo')
      .addSelect('n.descripcion', 'descripcion')
      .addSelect('MAX(n.fecha_creacion)', 'fecha_creacion')
      .where('n.id_usuario_origen = :id', { id: usuarioId })
      .andWhere('n.tipo = :tipo', { tipo: 'general' })
      .groupBy('n.titulo, n.descripcion')
      .orderBy('fecha_creacion', 'DESC');
    
    const rawResult = await qb.getRawMany();
    return rawResult.map(row => ({
      id_notificacion: Math.random(), // id fake para el frontend (ya que es un agrupamiento)
      titulo: row.titulo,
      descripcion: row.descripcion,
      tipo: 'general',
      is_new: false,
      fecha_creacion: row.fecha_creacion,
      usuario_destino: null as any,
      usuario_origen: null as any
    }));
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
