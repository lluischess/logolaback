import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateGeneralConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'La URL del logo del header no puede exceder 255 caracteres' })
  logoHeader: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL del logo del footer no puede exceder 255 caracteres' })
  logoFooter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL del favicon no puede exceder 255 caracteres' })
  favicon?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email de administración debe tener un formato válido' })
  @MaxLength(255, { message: 'El email de administración no puede exceder 255 caracteres' })
  emailAdministracion?: string;
}
