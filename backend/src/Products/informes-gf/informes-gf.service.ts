import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGF } from './entities/informe-gf.entity';
import { ObservacionGF } from './entities/observacion-gf.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Notificacion } from '../notificaciones/entities/notificacione.entity';
import * as fs from 'fs';
import * as path from 'path';

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
      veredicto_ia: 'pendiente',
      archivo_url: dto.archivo_url,
      usuario,
    });

    const saved = await this.informeGfRepository.save(informe);
    this.enviarAFlujoN8N(saved, 'GF', usuario);
    return saved;
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

  async aprobarConFirma(id: number, archivo_firmado_url: string): Promise<InformeGF> {
    const informe = await this.findOne(id);
    informe.estado = 'aprobado';
    informe.archivo_firmado_url = archivo_firmado_url;
    
    // Create automatic alert notification for the instructor
    if (informe.usuario) {
      const notif = this.notificacionRepository.create({
        titulo: `✅ Informe GF Aprobado (${informe.mes} ${informe.anio})`,
        descripcion: `Tu informe ha sido revisado y aprobado por el coordinador. Ya puedes descargar el documento con firmas.`,
        tipo: 'success',
        is_new: true,
        usuario_destino: informe.usuario,
      });
      await this.notificacionRepository.save(notif);
    }

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

  async saveResultadoIA(id: number, analisis_ia: string, veredicto_ia: string): Promise<InformeGF> {
    const informe = await this.findOne(id);
    informe.analisis_ia = analisis_ia;
    informe.veredicto_ia = veredicto_ia;
    return this.informeGfRepository.save(informe);
  }

  async reanalizarIA(id: number): Promise<{ message: string; informe: InformeGF }> {
    const informe = await this.findOne(id);
    if (!informe || !informe.usuario) {
      throw new NotFoundException('Informe o usuario no encontrado para reenviar a IA');
    }
    await this.enviarAFlujoN8N(informe, 'GF', informe.usuario);
    const updated = await this.findOne(id);
    return { message: 'Análisis de IA procesado y guardado exitosamente', informe: updated };
  }

  private async enviarAFlujoN8N(informe: InformeGF, tipo: string, usuario: Usuario): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), informe.archivo_url);
      if (!fs.existsSync(filePath)) {
        console.warn(`Archivo no encontrado para enviar a n8n: ${filePath}`);
        return;
      }
      const fileBuffer = await fs.promises.readFile(filePath);
      const base64File = fileBuffer.toString('base64');
      const nombreArchivo = path.basename(filePath);
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1927518.hstgr.cloud/webhook/revisar-informe';
      const fileUrl = `${process.env.FRONTEND_URL || 'https://informestimi.com'}/${informe.archivo_url}`;

      console.log(`🚀 Enviando Informe ${tipo} #${informe.id_informe_gf} al flujo n8n en ${webhookUrl}...`);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_informe: informe.id_informe_gf,
          tipo: tipo,
          cedula: String(usuario.cedula),
          telefono: String(usuario.telefono || '0000000000'),
          mes: informe.mes,
          anio: informe.anio,
          nombre_archivo: nombreArchivo,
          archivo_url: fileUrl,
          archivo_base64: base64File
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
      console.log(`✅ Respuesta directa recibida de n8n para Informe ${tipo} #${informe.id_informe_gf}:`, responseData);

      if (responseData) {
        const item = Array.isArray(responseData) ? responseData[0] : responseData;
        const analisis = item.mensaje || item.analisis_ia || item.mensaje_coordinador || item.text || item.output || (typeof item === 'string' ? item : null);
        const veredicto = item.veredicto_ia || (analisis && (analisis.includes('✅') || analisis.includes('COMPLETO')) ? 'aprobado_ia' : 'requiere_correccion');

        if (analisis && typeof analisis === 'string') {
          await this.saveResultadoIA(informe.id_informe_gf, analisis, veredicto);
          console.log(`🎉 Diagnóstico IA guardado exitosamente en base de datos para Informe ${tipo} #${informe.id_informe_gf}`);
        }
      }
    } catch (error) {
      console.error('Error al preparar archivo para n8n:', error);
    }
  }
}
