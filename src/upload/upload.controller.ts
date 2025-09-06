import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HostingerService } from './hostinger.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly hostingerService: HostingerService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: any,
    @Body('folder') folder?: string
  ) {
    try {
      const imageUrl = await this.hostingerService.uploadImage(file, folder || 'products');
      
      return {
        success: true,
        message: 'Imagen subida correctamente',
        imageUrl: imageUrl
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al subir la imagen',
        error: error.message
      };
    }
  }

  @Post('configuration')
  @UseInterceptors(FileInterceptor('image'))
  async uploadConfigurationImage(
    @UploadedFile() file: any
  ) {
    try {
      const imageUrl = await this.hostingerService.uploadImage(file, 'configuration');
      
      return {
        success: true,
        message: 'Imagen de configuración subida correctamente',
        imageUrl: imageUrl
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al subir la imagen de configuración',
        error: error.message
      };
    }
  }

  @Post('delete')
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    try {
      await this.hostingerService.deleteImage(imageUrl);
      
      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar la imagen',
        error: error.message
      };
    }
  }
}
