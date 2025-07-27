import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ConfigurationType } from '../interfaces/configuration.interface';

export class QueryConfigurationDto {
  @IsOptional()
  @IsEnum(ConfigurationType)
  tipo?: ConfigurationType;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limite?: number = 10;

  @IsOptional()
  @IsString()
  ordenarPor?: string = 'fechaCreacion';

  @IsOptional()
  @IsString()
  orden?: 'asc' | 'desc' = 'desc';
}
