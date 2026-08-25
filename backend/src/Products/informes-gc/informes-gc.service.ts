import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGC } from './entities/informe-gc.entity';
import { ObservacionGC } from './entities/observacion-gc.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Notificacion } from '../notificaciones/entities/notificacione.entity';
import * as fs from 'fs';
import * as path from 'path';

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
      veredicto_ia: 'pendiente',
      archivo_url: dto.archivo_url,
      usuario,
    });

    const saved = await this.informeGcRepository.save(informe);
    this.enviarAFlujoN8N(saved, 'GC', usuario);
    return saved;
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

  async saveResultadoIA(id: number, analisis_ia: string, veredicto_ia: string): Promise<InformeGC> {
    const informe = await this.findOne(id);
    informe.analisis_ia = analisis_ia;
    informe.veredicto_ia = veredicto_ia;
    return this.informeGcRepository.save(informe);
  }

  async reanalizarIA(id: number): Promise<{ message: string; informe: InformeGC }> {
    const informe = await this.findOne(id);
    if (!informe || !informe.usuario) {
      throw new NotFoundException('Informe o usuario no encontrado para reenviar a IA');
    }
    await this.enviarAFlujoN8N(informe, 'GC', informe.usuario);
    const updated = await this.findOne(id);
    return { message: 'Análisis de IA procesado y guardado exitosamente', informe: updated };
  }

  private async enviarAFlujoN8N(informe: InformeGC, tipo: string, usuario: Usuario): Promise<void> {
    try {
      const nombreArchivo = informe.archivo_url.split('/').pop() || 'informe.pdf';
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1927518.hstgr.cloud/webhook/revisar-informe';
      const fileUrl = `${process.env.FRONTEND_URL || 'http://informestimi.com'}/${informe.archivo_url}`;

      console.log(`🚀 Enviando Informe ${tipo} #${informe.id_informe_gc} al flujo n8n en ${webhookUrl}...`);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_informe: informe.id_informe_gc,
          tipo: tipo,
          cedula: String(usuario.cedula),
          telefono: String(usuario.telefono || '0000000000'),
          mes: informe.mes,
          anio: informe.anio,
          nombre_archivo: nombreArchivo,
          archivo_url: fileUrl
        }),
      }).catch((err) => {
        console.error(`❌ Error al contactar webhook de n8n: ${err.message || err}`);
        return null;
      });

      if (!res) return;

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Sin detalles');
        console.error(`❌ n8n respondió con error HTTP ${res.status}: ${errText}`);
        return;
      }
      const responseData = await res.json().catch(() => null);
      console.log(`✅ Respuesta directa recibida de n8n para Informe ${tipo} #${informe.id_informe_gc}:`, responseData);

      if (responseData) {
        const item = Array.isArray(responseData) ? responseData[0] : responseData;
        const analisis = item.mensaje || item.analisis_ia || item.mensaje_coordinador || item.text || item.output || (typeof item === 'string' ? item : null);
        const veredicto = item.veredicto_ia || (analisis && (analisis.includes('✅') || analisis.includes('COMPLETO')) ? 'aprobado_ia' : 'requiere_correccion');

        if (analisis && typeof analisis === 'string') {
          await this.saveResultadoIA(informe.id_informe_gc, analisis, veredicto);
          console.log(`🎉 Diagnóstico IA guardado exitosamente en base de datos para Informe ${tipo} #${informe.id_informe_gc}`);
        }
      }
    } catch (error) {
      console.error('Error al preparar archivo para n8n:', error);
    }
  }
}
