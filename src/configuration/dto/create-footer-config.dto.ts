import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateFooterConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El horario de atención no puede exceder 100 caracteres' })
  horarioAtencion: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'El contenido del footer no puede exceder 1000 caracteres' })
  contenidoFooter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El título del contenido no puede exceder 100 caracteres' })
  tituloContenidoFooter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL de Instagram no puede exceder 255 caracteres' })
  instagram?: string;
}
