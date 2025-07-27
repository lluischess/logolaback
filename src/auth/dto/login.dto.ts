import { IsString, MinLength, IsNotEmpty } from "class-validator";

export class LoginDto {
    
    @IsString()
    @IsNotEmpty()
    email: string; // Ahora acepta nombres de usuario, no solo emails

    @MinLength(8)
    password: string;
}