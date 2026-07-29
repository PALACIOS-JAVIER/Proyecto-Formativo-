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
    const usernameNormalizado = loginDto.username.trim().toLowerCase();
    
    let user = await this.usuarioRepository.findOne({ 
      where: { correo: usernameNormalizado },
      relations: { rol: true }
    });

    if (!user) {
        const cedula = parseInt(usernameNormalizado);
        if (!isNaN(cedula)) {
             user = await this.usuarioRepository.findOne({ 
                where: { cedula: cedula },
                relations: { rol: true }
              });
        }
    }

    if (!user) {
        if (loginDto.username === 'instructor' && loginDto.password === '123456') {
            const payload = { sub: 0, correo: 'demo@sena.edu.co', rol: 'instructor' };
            return {
                access_token: await this.jwtService.signAsync(payload),
                user: { id: 0, nombre: 'Instructor Demo', rol: 'instructor' }
            };
        }
        if (loginDto.username === 'coordinador' && loginDto.password === '123456') {
            const payload = { sub: -1, correo: 'admin@sena.edu.co', rol: 'coordinador' };
            return {
                access_token: await this.jwtService.signAsync(payload),
                user: { id: -1, nombre: 'Coordinador Demo', rol: 'coordinador' }
            };
        }

        throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.password !== loginDto.password) {
        throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Determinar rol dinámico (coordinador, apoyo_administrativo, o instructor)
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
