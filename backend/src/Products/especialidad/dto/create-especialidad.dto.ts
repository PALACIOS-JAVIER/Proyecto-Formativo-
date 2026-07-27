import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsNumber()
    @IsNotEmpty()
    id_area: number;
}
