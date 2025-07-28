import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @Put('seo')
  @HttpCode(HttpStatus.OK)
  updateSeoConfig(@Body() createSeoConfigDto: CreateSeoConfigDto) {
    return this.configurationService.updateSeoConfig(createSeoConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('footer')
  @HttpCode(HttpStatus.CREATED)
  createFooterConfig(@Body() createFooterConfigDto: CreateFooterConfigDto) {
    return this.configurationService.createFooterConfig(createFooterConfigDto);
  }

  @UseGuards(AuthGuard)
  @Put('footer')
  @HttpCode(HttpStatus.OK)
  updateFooterConfig(@Body() createFooterConfigDto: CreateFooterConfigDto) {
    return this.configurationService.updateFooterConfig(createFooterConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('general')
  @HttpCode(HttpStatus.CREATED)
  createGeneralConfig(@Body() createGeneralConfigDto: CreateGeneralConfigDto) {
    return this.configurationService.createGeneralConfig(createGeneralConfigDto);
  }

  @UseGuards(AuthGuard)
  @Put('general')
  @HttpCode(HttpStatus.OK)
  updateGeneralConfig(@Body() createGeneralConfigDto: CreateGeneralConfigDto) {
    return this.configurationService.updateGeneralConfig(createGeneralConfigDto);
  }

  @UseGuards(AuthGuard)
  @Post('banners')
  @HttpCode(HttpStatus.CREATED)
  createBanner(@Body() createBannerConfigDto: CreateBannerConfigDto) {
    return this.configurationService.createBanner(createBannerConfigDto);
  }

  @UseGuards(AuthGuard)
  @Put('banners')
  @HttpCode(HttpStatus.OK)
  updateBannersConfig(@Body() bannersData: any) {
    return this.configurationService.updateBannersConfig(bannersData);
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
  @Post('images/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/images',
      filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = extname(file.originalname);
        const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Validar tipos de archivo permitidos
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/ico'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP, ICO)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
  }))
  uploadImage(
    @UploadedFile() file: any,
    @Body('category') category?: string
  ) {
    console.log('=== UPLOAD IMAGE DEBUG ===');
    console.log('File received:', file);
    console.log('Category received:', category);
    
    if (!file) {
      console.error('ERROR: No file provided');
      throw new Error('No se ha proporcionado ningún archivo');
    }

    // Crear DTO con la información del archivo subido
    const createImageUploadDto: CreateImageUploadDto = {
      nombre: file.filename,
      nombreOriginal: file.originalname,
      ruta: `http://localhost:3000/uploads/images/${file.filename}`,
      categoria: category || 'general',
      tamaño: file.size,
      tipo: file.mimetype
    };
    
    console.log('DTO created:', createImageUploadDto);
    console.log('=== END DEBUG ===');

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
