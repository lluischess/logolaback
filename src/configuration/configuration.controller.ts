import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  CreateSeoConfigDto,
  CreateFooterConfigDto,
  CreateGeneralConfigDto,
  CreateBannerConfigDto,
  CreateImageUploadDto,
  QueryConfigurationDto,
  UpdateConfigurationDto
} from './dto';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  // ==================== ENDPOINTS PÚBLICOS ====================
  
  @Get('seo')
  @HttpCode(HttpStatus.OK)
  getSeoConfig() {
    return this.configurationService.getSeoConfig();
  }

  @Get('footer')
  @HttpCode(HttpStatus.OK)
  getFooterConfig() {
    return this.configurationService.getFooterConfig();
  }

  @Get('general')
  @HttpCode(HttpStatus.OK)
  getGeneralConfig() {
    return this.configurationService.getGeneralConfig();
  }

  @Get('banners')
  @HttpCode(HttpStatus.OK)
  getBanners(@Query('activo') activo?: string) {
    const activoBoolean = activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.configurationService.getBanners(activoBoolean);
  }

  @Get('banners/active')
  @HttpCode(HttpStatus.OK)
  getActiveBanners() {
    return this.configurationService.getBanners(true);
  }

  // ==================== ENDPOINTS PROTEGIDOS ====================

  @UseGuards(AuthGuard)
  @Post('seo')
  @HttpCode(HttpStatus.CREATED)
  createSeoConfig(@Body() createSeoConfigDto: CreateSeoConfigDto) {
    return this.configurationService.createSeoConfig(createSeoConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('footer')
  @HttpCode(HttpStatus.CREATED)
  createFooterConfig(@Body() createFooterConfigDto: CreateFooterConfigDto) {
    return this.configurationService.createFooterConfig(createFooterConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('general')
  @HttpCode(HttpStatus.CREATED)
  createGeneralConfig(@Body() createGeneralConfigDto: CreateGeneralConfigDto) {
    return this.configurationService.createGeneralConfig(createGeneralConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('banners')
  @HttpCode(HttpStatus.CREATED)
  createBanner(@Body() createBannerConfigDto: CreateBannerConfigDto) {
    return this.configurationService.createBanner(createBannerConfigDto);
  }

  @UseGuards(AuthGuard)
  @Patch('banners/:id')
  @HttpCode(HttpStatus.OK)
  updateBanner(@Param('id') id: string, @Body() updateData: any) {
    return this.configurationService.updateBanner(id, updateData);
  }

  @UseGuards(AuthGuard)
  @Delete('banners/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBanner(@Param('id') id: string) {
    return this.configurationService.deleteBanner(id);
  }

  @UseGuards(AuthGuard)
  @Patch('banners/:id/reorder')
  @HttpCode(HttpStatus.OK)
  reorderBanner(@Param('id') id: string, @Body('newOrder') newOrder: number) {
    return this.configurationService.reorderBanners(id, newOrder);
  }

  @UseGuards(AuthGuard)
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  uploadImage(@Body() createImageUploadDto: CreateImageUploadDto) {
    return this.configurationService.uploadImage(createImageUploadDto);
  }

  @UseGuards(AuthGuard)
  @Get('images')
  @HttpCode(HttpStatus.OK)
  getImages(@Query() query: QueryConfigurationDto) {
    return this.configurationService.getImages(query);
  }

  @UseGuards(AuthGuard)
  @Delete('images/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(@Param('id') id: string) {
    return this.configurationService.deleteImage(id);
  }

  // ==================== ENDPOINTS GENERALES ====================

  @UseGuards(AuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryConfigurationDto) {
    return this.configurationService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  getStats() {
    return this.configurationService.getStats();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.configurationService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateConfigurationDto: UpdateConfigurationDto) {
    return this.configurationService.update(id, updateConfigurationDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.configurationService.remove(id);
  }
}
