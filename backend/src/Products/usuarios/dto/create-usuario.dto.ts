import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEmail, IsOptional } from 'class-validator';

export class CreateUsuarioDto {

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
    correo:string;

    @IsString()
    @IsNotEmpty()
    id_sede: string;

    @IsString()
    @IsNotEmpty()
    id_rol: string;

    @IsString()
    @IsNotEmpty()
    id_area: string;

    @IsString()
    @IsOptional()
    codigoContrato?: string;

    @IsNumber()
    @IsOptional()
    codigoSiif?: number;

    @IsDateString()
    @IsOptional()
    fechaInicioContrato?: Date;

    @IsDateString()
    @IsOptional()   
    fechaFinContrato?: Date;

    @IsString()
    @IsOptional()
    estado_cuenta?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    fotoPerfil?: string;

    @IsString()
    @IsOptional()
    firma?: string;

    @IsString()
    @IsOptional()
    passwordConfirm?: string;
}
