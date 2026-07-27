import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateHistorialDto {
    @IsString()
    @IsNotEmpty()
    accion: string;

    @IsString()
    @IsNotEmpty()
    detalles: string;

    @IsNumber()
    @IsNotEmpty()
    id_coordinador: number;

    @IsOptional()
    @IsNumber()
    id_instructor?: number;

    @IsOptional()
    @IsNumber()
    id_informe?: number;
}
