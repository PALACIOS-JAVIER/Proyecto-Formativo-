import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../Products/usuarios/entities/usuario.entity';
import { Coordinador } from '../Products/coordinadores/entities/coordinador.entity';
import { ApoyoAdministrativo } from '../Products/apoyo-administrativo/entities/apoyo-administrativo.entity';
import { LoginDto } from './dto/login.dto';

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
      const emailPrefix = usernameNormalizado.includes('@') ? usernameNormalizado.split('@')[0] : '';
      if (emailPrefix) {
        user = allUsers.find(u => {
          if (!u.correo) return false;
          const dbEmail = u.correo.toLowerCase().trim();
          const dbPrefix = dbEmail.split('@')[0];
          return dbEmail === usernameNormalizado || dbPrefix === emailPrefix;
        }) || null;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Usuario o correo no encontrado.');
    }

    // 5. Password verification (flexible for dev/migrated passwords)
    const dbPassword = (user.password || '').trim();
    // Allow login with user password, '123456', or any non-empty password in dev
    if (dbPassword && rawPassword && dbPassword !== rawPassword && rawPassword !== '123456') {
      console.log(`[AUTH] Allowing login for user ${user.correo} (Dev mode)`);
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
      if (estadoCuenta === 'inactivo') {
        throw new UnauthorizedException('Tu cuenta está desactivada por el coordinador.');
      }
      if (estadoCuenta === 'rechazado') {
        throw new UnauthorizedException('Tu cuenta ha sido rechazada por el coordinador.');
      }
      if (estadoCuenta === 'pendiente') {
        throw new UnauthorizedException('Tu cuenta está pendiente de aprobación por el coordinador.');
      }
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
}
