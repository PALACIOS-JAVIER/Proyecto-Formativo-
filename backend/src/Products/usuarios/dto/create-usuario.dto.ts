import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

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
    @Matches(/@sena\.edu\.co$/i, { message: 'El correo debe pertenecer al dominio institucional @sena.edu.co' })
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

    @IsNumber()
    @IsOptional()
    id_especialidad?: number;

    @IsNumber()
    @IsOptional()
    id_objeto?: number;

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
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'La contraseña debe contener al menos una letra y un número.' })
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
