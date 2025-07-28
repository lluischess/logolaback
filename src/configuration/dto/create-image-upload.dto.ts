import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min, IsIn } from 'class-validator';

export class CreateImageUploadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'El nombre original no puede exceder 255 caracteres' })
  nombreOriginal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'La ruta no puede exceder 500 caracteres' })
  ruta: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'La categoría no puede exceder 50 caracteres' })
  @IsIn(['general', 'seo', 'banner-desktop', 'banner-mobile'], {
    message: 'Categoría no válida. Permitidas: general, seo, banner-desktop, banner-mobile'
  })
  categoria?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/ico'], {
    message: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, GIF, WebP, ICO'
  })
  tipo: string;

  @IsNumber()
  @Min(1, { message: 'El tamaño debe ser mayor a 0' })
  tamaño: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;
}
