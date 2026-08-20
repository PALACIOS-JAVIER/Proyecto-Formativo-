import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../Products/usuarios/entities/usuario.entity';
import { Coordinador } from '../Products/coordinador/entities/coordinador.entity';
import { ApoyoAdministrativo } from '../Products/apoyo-administrativo/entities/apoyo-administrativo.entity';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

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

  private recoveryCodes = new Map<string, { code: string; expiresAt: number }>();

  async login(loginDto: LoginDto) {
    const rawUsername = (loginDto.username || '').trim();
    const usernameNormalizado = rawUsername.toLowerCase();
    const rawPassword = (loginDto.password || '').trim();

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

    // Password verification with bcrypt
    const dbPassword = (user.password || '').trim();
    if (!dbPassword || !rawPassword) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    // Support both bcrypt hashed passwords and legacy plain text (for migration)
    let passwordValid = false;
    if (dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2a$')) {
      // Password is already hashed with bcrypt
      passwordValid = await bcrypt.compare(rawPassword, dbPassword);
    } else {
      // Legacy plain text password — compare directly, then upgrade to hash
      passwordValid = dbPassword === rawPassword;
      if (passwordValid) {
        // Auto-migrate: hash the plain text password for future logins
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        await this.usuarioRepository.update(user.id_Usuario, { password: hashedPassword });
      }
    }

    if (!passwordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    // Determinar si es coordinador o apoyo administrativo
    let specificRole = user.rol?.nombre;
    if (specificRole === 'Apoyo Administrativo') {
        const isCoordinador = await this.coordinadorRepository.findOne({ where: { usuario: { id_Usuario: user.id_Usuario } } });
        if (isCoordinador) {
            specificRole = 'coordinador';
        } else {
            const isApoyo = await this.apoyoRepository.findOne({ where: { usuario: { id_Usuario: user.id_Usuario } } });
            if (isApoyo) {
                specificRole = 'apoyo_administrativo';
            }
        }
    } else if (specificRole === 'Campesina' || specificRole === 'Regular Fic') {
        specificRole = 'instructor';
    }

    const payload = { sub: user.id_Usuario, correo: user.correo, rol: specificRole };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id_Usuario,
        nombre: `${user.nombre} ${user.apellido}`,
        correo: user.correo,
        rol: specificRole,
      }
    };
  }

  async forgotPassword(usernameOrEmail: string) {
    const usernameNormalizado = (usernameOrEmail || '').trim().toLowerCase();
    
    let user = await this.usuarioRepository.findOne({ where: { correo: usernameNormalizado } });
    if (!user) {
      const cedula = parseInt(usernameNormalizado);
      if (!isNaN(cedula)) {
        user = await this.usuarioRepository.findOne({ where: { cedula } });
      }
    }
    if (!user) {
      const allUsers = await this.usuarioRepository.find();
      const emailPrefix = usernameNormalizado.includes('@') ? usernameNormalizado.split('@')[0] : '';
      if (emailPrefix) {
        user = allUsers.find(u => {
          if (!u.correo) return false;
          const dbEmail = u.correo.toLowerCase().trim();
          return dbEmail === usernameNormalizado || dbEmail.split('@')[0] === emailPrefix;
        }) || null;
      }
    }

    if (!user) {
      throw new BadRequestException('No se encontró ningún usuario registrado con ese correo institucional o usuario en el sistema.');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    const targetEmail = user.correo;
    this.recoveryCodes.set(targetEmail.toLowerCase().trim(), { code: verificationCode, expiresAt });

    console.log(`\n======================================================`);
    console.log(`[AUTH RECOVERY CODE] CÓDIGO DE VERIFICACIÓN GENERADO:`);
    console.log(`Usuario: ${user.nombre} ${user.apellido} (${targetEmail})`);
    console.log(`Código de 6 dígitos: ${verificationCode}`);
    console.log(`======================================================\n`);

    if (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes('tu-correo-sena')) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"SENA - Proyecto Formativo" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          subject: 'Código de Verificación - Restablecer Contraseña SENA',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #39A900; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 24px;">SENA - Restablecimiento de Contraseña</h2>
              </div>
              <div style="padding: 30px; color: #333333;">
                <p>Hola <strong>${user.nombre}</strong>,</p>
                <p>Has solicitado restablecer la contraseña de tu cuenta en la plataforma del Proyecto Formativo SENA.</p>
                <p>Utiliza el siguiente código de verificación para completar el proceso. Este código expirará en 15 minutos:</p>
                <div style="margin: 30px 0; text-align: center;">
                  <span style="background-color: #f4f4f4; border: 2px dashed #39A900; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #222;">
                    ${verificationCode}
                  </span>
                </div>
                <p style="font-size: 14px; color: #777;">Si no solicitaste este cambio, puedes ignorar este correo; tu cuenta permanece segura.</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee;">
                Servicio Nacional de Aprendizaje SENA &copy; 2026
              </div>
            </div>
          `,
        });
        console.log(`[EMAIL ENVIADO] Código de verificación enviado exitosamente a ${targetEmail}`);
      } catch (err: any) {
        console.error(`[EMAIL ERROR] No se pudo enviar el correo por SMTP (${err.message}).`);
        throw new BadRequestException('Error interno: No se pudo enviar el correo electrónico. Inténtalo más tarde o contacta al administrador.');
      }
    } else {
      console.log(`[INFO] Credenciales SMTP no configuradas o en modo desarrollo. Puedes usar el código mostrado arriba en consola.`);
      // En producción, si no hay SMTP, debería fallar
      if (process.env.NODE_ENV === 'production') {
         throw new BadRequestException('El sistema de correos no está configurado en el servidor.');
      }
    }

    return { 
      success: true, 
      message: 'Código de verificación generado y enviado al correo institucional.',
      correo: targetEmail
    };
  }

  async resetPassword(correo: string, codigo: string, nuevaContrasena: string) {
    if (!correo || !codigo || !nuevaContrasena) {
      throw new BadRequestException('Por favor ingrese el correo, el código de verificación y la nueva contraseña.');
    }

    const cleanCorreo = correo.toLowerCase().trim();
    const record = this.recoveryCodes.get(cleanCorreo);

    if (!record) {
      throw new BadRequestException('No se ha solicitado ningún código de verificación para este correo o el código ya expiró.');
    }

    if (Date.now() > record.expiresAt) {
      this.recoveryCodes.delete(cleanCorreo);
      throw new BadRequestException('El código de verificación ha expirado (límite 15 minutos). Por favor solicite uno nuevo.');
    }

    if (record.code !== codigo.trim()) {
      throw new BadRequestException('El código de verificación ingresado es incorrecto.');
    }

    const user = await this.usuarioRepository.findOne({ where: { correo: cleanCorreo } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado en el sistema.');
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena.trim(), 10);
    user.password = hashedPassword;
    await this.usuarioRepository.save(user);

    this.recoveryCodes.delete(cleanCorreo);
    console.log(`[PASSWORD RESET SUCCESS] La contraseña de ${cleanCorreo} fue actualizada con éxito.`);

    return { success: true, message: '¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión con tu nueva clave.' };
  }
}
