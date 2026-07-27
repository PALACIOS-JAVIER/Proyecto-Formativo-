import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    username: string; // The frontend currently sends 'username'

    @IsString()
    @IsNotEmpty()
    password: string;
}
