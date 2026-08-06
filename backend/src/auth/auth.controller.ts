import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body('correo') correo: string, @Body('username') username: string) {
    return this.authService.forgotPassword(correo || username);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(
    @Body('correo') correo: string,
    @Body('codigo') codigo: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
  ) {
    return this.authService.resetPassword(correo, codigo, nuevaContrasena);
  }
}
