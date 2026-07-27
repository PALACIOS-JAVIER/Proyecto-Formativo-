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
    @IsNotEmpty()
    codigoContrato: string;

    @IsNumber()
    @IsNotEmpty()
    codigoSiif: number;

    @IsDateString()
    @IsNotEmpty()
    fechaInicioContrato: Date;

    @IsDateString()
    @IsNotEmpty()   
    fechaFinContrato: Date;

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
    @IsNotEmpty()
    passwordConfirm: string;

}
