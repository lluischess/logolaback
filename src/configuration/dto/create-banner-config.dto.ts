import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min, IsBoolean, IsHexColor } from 'class-validator';

export class CreateBannerConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El título no puede exceder 100 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El subtítulo no puede exceder 200 caracteres' })
  subtitulo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'La URL de la imagen desktop no puede exceder 255 caracteres' })
  imagenDesktop: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La URL de la imagen mobile no puede exceder 255 caracteres' })
  imagenMobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'El enlace del botón no puede exceder 255 caracteres' })
  enlaceButton?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El nombre del botón no puede exceder 50 caracteres' })
  nombreButton?: string;

  @IsNumber()
  @Min(1, { message: 'El orden del banner debe ser mayor a 0' })
  ordenBanner: number;

  @IsOptional()
  @IsString()
  @MaxLength(7, { message: 'El color del botón debe ser un código hexadecimal válido' })
  colorBoton?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7, { message: 'El color de los títulos debe ser un código hexadecimal válido' })
  colorTitulos?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
