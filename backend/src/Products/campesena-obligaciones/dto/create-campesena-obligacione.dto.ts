import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCampesenaObligacioneDto {
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsOptional()
    orden?: number;

    @IsBoolean()
    @IsOptional()
    activa?: boolean;
}
