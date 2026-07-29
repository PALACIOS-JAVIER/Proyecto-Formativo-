import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional } from 'class-validator';

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
  correo: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsOptional()
  id_coordinador_usuario?: number;
}
