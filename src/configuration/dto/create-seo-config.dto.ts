import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreateSeoConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60, { message: 'El título de la página principal no puede exceder 60 caracteres' })
  tituloPaginaPrincipal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160, { message: 'La meta descripción no puede exceder 160 caracteres' })
  metaDescripcionPrincipal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Las palabras clave no pueden exceder 200 caracteres' })
  palabrasClave: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'El nombre del sitio no puede exceder 50 caracteres' })
  nombreSitio: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL de la imagen no puede exceder 255 caracteres' })
  imagenPorDefecto?: string;
}
