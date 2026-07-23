import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsNotEmpty()
    id_rol: number; 
}
