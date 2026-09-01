import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEmail, IsOptional, Matches, IsBoolean, Equals } from 'class-validator';

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

    @IsEmail({}, { message: 'El correo debe ser válido' })
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
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9\s]).{8,}$/, {
        message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.',
    })
    password: string;

    @IsString()
    @IsOptional()
    fotoPerfil?: string;

    @IsString()
    @IsOptional()
    firma?: string;

    @IsString()
    @IsNotEmpty()
    passwordConfirm: string;

    @IsBoolean()
    @Equals(true, { message: 'Debes aceptar los términos y condiciones para continuar' })
    aceptaTerminos: boolean;
}
