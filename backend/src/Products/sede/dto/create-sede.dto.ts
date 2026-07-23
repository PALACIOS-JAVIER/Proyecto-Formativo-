import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSedeDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
