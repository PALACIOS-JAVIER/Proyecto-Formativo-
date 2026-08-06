import { IsInt, IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCoordinadorDto {
    @IsInt()
    @IsNotEmpty()
    id_sede: number;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsInt()
    @IsNotEmpty()
    cedula: number;

    @IsInt()
    @IsNotEmpty()
    telefono: number;

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsInt()
    @IsOptional()
    anio_ejercicio?: number;
}
