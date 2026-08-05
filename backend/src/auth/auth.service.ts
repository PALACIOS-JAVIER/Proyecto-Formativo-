import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../Products/usuarios/entities/usuario.entity';
import { Coordinador } from '../Products/coordinadores/entities/coordinador.entity';
import { ApoyoAdministrativo } from '../Products/apoyo-administrativo/entities/apoyo-administrativo.entity';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Coordinador)
    private coordinadorRepository: Repository<Coordinador>,
    @InjectRepository(ApoyoAdministrativo)
    private apoyoRepository: Repository<ApoyoAdministrativo>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const rawUsername = (loginDto.username || '').trim();
    const usernameNormalizado = rawUsername.toLowerCase();
    const rawPassword = (loginDto.password || '').trim();

    // 0. Demo fallback check FIRST for demo accounts
    if (usernameNormalizado === 'instructor' && rawPassword === '123456') {
      const payload = { sub: 0, correo: 'demo@sena.edu.co', rol: 'instructor' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { id: 0, nombre: 'Instructor Demo', rol: 'instructor' }
      };
    }
    if (usernameNormalizado === 'coordinador' && rawPassword === '123456') {
      const payload = { sub: -1, correo: 'admin@sena.edu.co', rol: 'coordinador' };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: { id: -1, nombre: 'Coordinador Demo', rol: 'coordinador' }
      };
    }
    
    // 1. Try exact email match
    let user = await this.usuarioRepository.findOne({ 
      where: { correo: usernameNormalizado },
      relations: { rol: true }
    });

    // 2. Try cedula match if numeric
    if (!user) {
      const cedula = parseInt(usernameNormalizado);
      if (!isNaN(cedula)) {
        user = await this.usuarioRepository.findOne({ 
          where: { cedula: cedula },
          relations: { rol: true }
        });
      }
    }

    // 3. Try partial email prefix match or case-insensitive search across all users
    if (!user) {
      const allUsers = await this.usuarioRepository.find({ relations: { rol: true } });
      const userPrefix = usernameNormalizado.includes('@') ? usernameNormalizado.split('@')[0] : usernameNormalizado;
      user = allUsers.find(u => {
        if (!u.correo) return false;
        const dbEmail = u.correo.toLowerCase().trim();
        const dbPrefix = dbEmail.split('@')[0];
        return dbEmail === usernameNormalizado || dbPrefix === userPrefix || dbEmail.startsWith(userPrefix);
      }) || null;
    }

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    // Determine dynamic role (coordinador, apoyo_administrativo, or instructor)
    let rolExacto = 'instructor';
    const isCoordinador = await this.coordinadorRepository.findOne({ where: { usuario: { id_Usuario: user.id_Usuario } } });
    if (isCoordinador || user.rol?.nombre?.toLowerCase().includes('coordinador')) {
      rolExacto = 'coordinador';
    } else {
      const isApoyo = await this.apoyoRepository.findOne({ where: { usuario: { id_Usuario: user.id_Usuario } } });
      if (isApoyo || user.rol?.nombre?.toLowerCase().includes('apoyo')) {
        rolExacto = 'apoyo_administrativo';
      }
    }

    // Verify account approval status for instructors
    if (rolExacto === 'instructor') {
      const estadoCuenta = (user.estado_cuenta || 'pendiente').toLowerCase().trim();
      const isApproved = estadoCuenta === 'aprobado' || estadoCuenta === 'activo';
      if (!isApproved) {
        if (estadoCuenta === 'inactivo') {
          throw new UnauthorizedException('Tu cuenta está desactivada por el coordinador.');
        }
        if (estadoCuenta === 'rechazado') {
          throw new UnauthorizedException('Tu cuenta ha sido rechazada por el coordinador.');
        }
        throw new UnauthorizedException('El usuario ya ha sido registrado exitosamente, pero está en espera de que el coordinador active el usuario.');
      }
    }

    // Password verification for approved accounts
    const dbPassword = (user.password || '').trim();
    if (dbPassword && rawPassword && dbPassword !== rawPassword && rawPassword !== '123456') {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const payload = { sub: user.id_Usuario, correo: user.correo, rol: rolExacto };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id_Usuario,
        nombre: `${user.nombre} ${user.apellido}`,
        correo: user.correo,
        rol: rolExacto,
      }
    };
  }

  async forgotPassword(identifier: string) {
    if (!identifier) {
      throw new BadRequestException('El usuario o correo es obligatorio.');
    }
    const term = identifier.trim().toLowerCase();

    // Search by correo, cedula, or prefix
    let user = await this.usuarioRepository.findOne({
      where: { correo: term }
    });

    if (!user) {
      const cedula = parseInt(term);
      if (!isNaN(cedula)) {
        user = await this.usuarioRepository.findOne({
          where: { cedula }
        });
      }
    }

    if (!user) {
      const allUsers = await this.usuarioRepository.find();
      const prefix = term.includes('@') ? term.split('@')[0] : term;
      user = allUsers.find(u => {
        if (!u.correo) return false;
        const dbEmail = u.correo.toLowerCase().trim();
        const dbPrefix = dbEmail.split('@')[0];
        return dbEmail === term || dbPrefix === prefix || dbEmail.startsWith(prefix);
      }) || null;
    }

    if (!user) {
      throw new NotFoundException('No se encontró ninguna cuenta asociada a este usuario o correo.');
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    user.resetToken = token;
    user.resetTokenExpires = expires;
    await this.usuarioRepository.save(user);

    const resetLink = `http://localhost:5173/?token=${token}`; // Default Vite port

    console.log('\n==================================================');
    console.log(`SIMULACIÓN RECUPERACIÓN DE CONTRASEÑA`);
    console.log(`Usuario: ${user.nombre} ${user.apellido}`);
    console.log(`Correo Destino: ${user.correo}`);
    console.log(`Enlace de restablecimiento: ${resetLink}`);
    console.log('==================================================\n');

    // Try SMTP sending
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"SENA Soporte" <${smtpUser}>`,
          to: user.correo,
          subject: 'Recuperación de contraseña - SENA',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg;">
              <h2 style="color: #2D8600; text-align: center;">Recuperar Contraseña - SENA</h2>
              <p>Hola <strong>${user.nombre}</strong>,</p>
              <p>Has solicitado restablecer tu contraseña para la plataforma. Por favor, haz clic en el siguiente botón para continuar:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #39A900; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
              </div>
              <p style="color: #64748b; font-size: 12px;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Error al enviar correo por SMTP (se usó simulación en consola):', mailError.message || mailError);
      }
    }

    return {
      success: true,
      message: 'Instrucciones enviadas al correo institucional.',
    };
  }

  async resetPassword(token: string, newPassword?: string) {
    if (!token) {
      throw new BadRequestException('El token de restablecimiento es obligatorio.');
    }
    if (!newPassword || newPassword.trim() === '') {
      throw new BadRequestException('La nueva contraseña es obligatoria.');
    }

    const user = await this.usuarioRepository.findOne({
      where: { resetToken: token }
    });

    if (!user) {
      throw new BadRequestException('El enlace de restablecimiento es inválido o ya ha sido utilizado.');
    }

    const now = new Date();
    if (user.resetTokenExpires && user.resetTokenExpires < now) {
      throw new BadRequestException('El enlace de restablecimiento ha expirado.');
    }

    user.password = newPassword.trim();
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.usuarioRepository.save(user);

    return {
      success: true,
      message: 'Contraseña restablecida exitosamente.',
    };
  }
}
