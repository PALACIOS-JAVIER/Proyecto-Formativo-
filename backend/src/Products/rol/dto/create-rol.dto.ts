import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRolDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsNotEmpty()
    id_sede: number; // ID de la sede a la que pertenece este rol
}
