import { IsInt, IsNotEmpty, IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateApoyoAdministrativoDto {
    @IsInt()
    @IsNotEmpty()
    id_usuario: number;

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

}
