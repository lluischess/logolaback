import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(['chocolates', 'caramelos', 'novedades', 'navidad', 'galletas', 'hoteles', 'bombones', 'minibar'])
  categoria?: string;

  @IsOptional()
  @IsEnum(['grande', 'mediano', 'pequeño'])
  talla?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidadMinima?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  publicado?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  ordenCategoria?: number;

  // Parámetros de paginación
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  // Parámetros de ordenamiento
  @IsOptional()
  @IsEnum(['nombre', 'referencia', 'categoria', 'cantidadMinima', 'publicado', 'ordenCategoria', 'createdAt', 'updatedAt'])
  sortBy?: string = 'categoria';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  // Búsqueda de texto
  @IsOptional()
  @IsString()
  search?: string;
}
