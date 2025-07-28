import { IsString, IsOptional, IsBoolean, IsInt, Min, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden: number;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean = true;

  @IsOptional()
  @IsBoolean()
  configuracionEspecial?: boolean = false;

  // Campos SEO
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'El meta título no puede exceder 60 caracteres' })
  metaTitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'La meta descripción no puede exceder 160 caracteres' })
  metaDescripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Las palabras clave no pueden exceder 200 caracteres' })
  palabrasClave?: string;

  @IsOptional()
  @IsString()
  urlSlug?: string;

  // Open Graph
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'El OG título no puede exceder 60 caracteres' })
  ogTitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'La OG descripción no puede exceder 160 caracteres' })
  ogDescripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La OG imagen no puede exceder 200 caracteres' })
  ogImagen?: string;
}
