import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../Products/usuarios/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Buscar usuario por correo (o cédula si el username es un número)
    const usernameNormalizado = loginDto.username.trim().toLowerCase();
    
    // For now, we will allow login with 'instructor' / 'coordinador' to match frontend,
    // but also check real database
    let user = await this.usuarioRepository.findOne({ 
      where: { correo: usernameNormalizado },
      relations: { rol: true }
    });

    if (!user) {
        // Fallback for cedula
        const cedula = parseInt(usernameNormalizado);
        if (!isNaN(cedula)) {
             user = await this.usuarioRepository.findOne({ 
                where: { cedula: cedula },
                relations: { rol: true }
              });
        }
    }

    if (!user) {
        // Fallback for demo frontend credentials if not in db yet
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

    // Comprobar contraseña
    if (user.password !== loginDto.password) {
        throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { sub: user.id_Usuario, correo: user.correo, rol: user.rol?.nombre };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id_Usuario,
        nombre: `${user.nombre} ${user.apellido}`,
        correo: user.correo,
        rol: user.rol?.nombre,
      }
    };
  }
}
