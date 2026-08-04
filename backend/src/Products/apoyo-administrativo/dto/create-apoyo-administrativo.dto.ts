import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateApoyoAdministrativoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsNumber()
  @IsNotEmpty()
  cedula: number;

  @IsNumber()
  @IsNotEmpty()
  telefono: number;

  @IsEmail()
  @Matches(/@sena\.edu\.co$/i, { message: 'El correo debe pertenecer al dominio institucional @sena.edu.co' })
  correo: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsOptional()
  id_coordinador_usuario?: number;
}
