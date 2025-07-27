import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateSeoConfigDto } from './create-seo-config.dto';
import { CreateFooterConfigDto } from './create-footer-config.dto';
import { CreateGeneralConfigDto } from './create-general-config.dto';
import { CreateBannerConfigDto } from './create-banner-config.dto';
import { CreateImageUploadDto } from './create-image-upload.dto';

// DTO genérico para actualización
export class UpdateConfigurationDto {
  @IsOptional()
  datos?: any; // Puede ser cualquiera de los tipos de configuración

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// DTOs específicos para cada tipo de configuración
export class UpdateSeoConfigDto extends PartialType(CreateSeoConfigDto) {}
export class UpdateFooterConfigDto extends PartialType(CreateFooterConfigDto) {}
export class UpdateGeneralConfigDto extends PartialType(CreateGeneralConfigDto) {}
export class UpdateBannerConfigDto extends PartialType(CreateBannerConfigDto) {}
export class UpdateImageUploadDto extends PartialType(CreateImageUploadDto) {}
