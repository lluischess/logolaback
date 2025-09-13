import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  MaxLength, 
  Min, 
  Max, 
  ArrayMaxSize,
  IsUrl 
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  referencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion: string;

  @IsEnum(['grande', 'mediano', 'pequeño'])
  talla: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  medidas: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(3)
  imagenes?: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  ingredientes: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  masDetalles?: string;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  cantidadMinima: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  precio?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  ordenCategoria?: number;

  @IsBoolean()
  @IsOptional()
  publicado?: boolean = true;

  @IsString()
  @IsOptional()
  consumePreferente?: string;

  // SEO Fields
  @IsString()
  @IsOptional()
  @MaxLength(60)
  metaTitulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  palabrasClave?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  urlSlug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  ogTitulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  ogDescripcion?: string;

  @IsOptional()
  @IsString()
  ogImagen?: string;
}
