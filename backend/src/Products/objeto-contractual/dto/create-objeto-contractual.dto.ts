import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateObjetoContractualDto {
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    id_area: number; // ID del área a la que se le asignará este objeto
}
