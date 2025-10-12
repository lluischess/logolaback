import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class HostingerService {
  constructor(private configService: ConfigService) {}

  async uploadImage(file: any, folder: string = 'products'): Promise<string> {
    const client = new ftp.Client();
    
    try {
      // Conectar a Hostinger FTP
      const ftpHost = this.configService.get('FTP_HOST') || 'ftp.logolate.com';
      const ftpUser = this.configService.get('FTP_USER') || 'u317949253.render';
      const ftpPassword = this.configService.get('FTP_PASSWORD');
      
      console.log('🔗 Conectando FTP:', { host: ftpHost, user: ftpUser });
      
      if (!ftpPassword) {
        throw new Error('FTP_PASSWORD no configurada en variables de entorno');
      }
      
      await client.access({
        host: ftpHost,
        user: ftpUser,
        password: ftpPassword,
        secure: false
      });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${folder}_${timestamp}${extension}`;
      
      // Ruta correcta en Hostinger: /public_html/uploads/{folder}
      const remotePath = `/public_html/uploads/${folder}/${filename}`;

      // Crear directorio si no existe
      try {
        await client.ensureDir(`/public_html/uploads/${folder}`);
      } catch (error) {
        console.log('Directorio ya existe o no se pudo crear');
      }

      // Subir archivo
      if (file.buffer) {
        // Crear archivo temporal
        const tempPath = `/tmp/${filename}`;
        fs.writeFileSync(tempPath, file.buffer);
        
        await client.uploadFrom(tempPath, remotePath);
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPath);
      } else {
        await client.uploadFrom(file.path, remotePath);
      }

      // Construir URL pública
      const baseUrl = this.configService.get('FRONTEND_URL') || 'https://www.logolate.com';
      const publicUrl = `${baseUrl}/uploads/${folder}/${filename}`;

      console.log('✅ Imagen subida correctamente a:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Error uploading to Hostinger:', error);
      throw new Error('Failed to upload image to Hostinger');
    } finally {
      client.close();
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const client = new ftp.Client();
    
    try {
      await client.access({
        host: this.configService.get('FTP_HOST'),
        user: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASSWORD'),
        secure: false
      });

      // Extraer path del archivo desde la URL
      // Ej: https://www.logolate.com/uploads/products/image.png
      // pathname = /uploads/products/image.png
      // remotePath = /public_html/uploads/products/image.png
      const urlPath = new URL(imageUrl).pathname;
      const remotePath = `/public_html${urlPath}`;

      await client.remove(remotePath);

    } catch (error) {
      console.error('Error deleting from Hostinger:', error);
    } finally {
      client.close();
    }
  }
}
