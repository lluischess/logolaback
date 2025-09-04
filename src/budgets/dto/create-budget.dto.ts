import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  referencia: string;

  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El subtotal debe ser mayor o igual a 0' })
  subtotal?: number;
}

export class ClientDataDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La empresa no puede exceder 100 caracteres' })
  empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Los detalles del cliente no pueden exceder 1000 caracteres' })
  detalles?: string;
}

export class CreateBudgetDto {
  @ValidateNested()
  @Type(() => ClientDataDto)
  cliente: ClientDataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetProductDto)
  productos: BudgetProductDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El logotipo no puede exceder 500 caracteres' })
  logotipoEmpresa?: string;

  @IsOptional()
  @IsBoolean()
  aceptaCorreosPublicitarios?: boolean = false;

  @IsOptional()
  @IsString()
  @MaxLength(600, { message: 'Las observaciones no pueden exceder 600 caracteres' })
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notas?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El precio total debe ser mayor o igual a 0' })
  precioTotal?: number;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}
