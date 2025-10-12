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
      
      console.log('🔗 Intentando conectar FTP...');
      console.log('   Host:', ftpHost);
      console.log('   User:', ftpUser);
      console.log('   Password configurado:', !!ftpPassword);
      
      if (!ftpPassword) {
        throw new Error('FTP_PASSWORD no configurada en variables de entorno');
      }
      
      await client.access({
        host: ftpHost,
        user: ftpUser,
        password: ftpPassword,
        secure: false
      });
      
      console.log('✅ Conexión FTP establecida');

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${folder}_${timestamp}${extension}`;
      
      // Ruta correcta en Hostinger: /public_html/uploads/{folder}
      const remotePath = `/public_html/uploads/${folder}/${filename}`;
      
      console.log('📁 Ruta remota FTP:', remotePath);

      // Crear directorio si no existe
      try {
        await client.ensureDir(`/public_html/uploads/${folder}`);
        console.log('✅ Directorio verificado/creado');
      } catch (error) {
        console.log('⚠️ Error al crear directorio:', error.message);
      }

      // Subir archivo
      console.log('📤 Iniciando subida del archivo...');
      if (file.buffer) {
        // Crear archivo temporal
        const tempPath = `/tmp/${filename}`;
        fs.writeFileSync(tempPath, file.buffer);
        console.log('   Archivo temporal creado:', tempPath);
        
        await client.uploadFrom(tempPath, remotePath);
        console.log('   ✅ Archivo subido por FTP');
        
        // Limpiar archivo temporal
        fs.unlinkSync(tempPath);
        console.log('   🗑️ Archivo temporal eliminado');
      } else {
        await client.uploadFrom(file.path, remotePath);
        console.log('   ✅ Archivo subido por FTP desde path');
      }

      // Establecer permisos 644 (rw-r--r--) para que sea accesible públicamente
      try {
        await client.send('SITE CHMOD 644 ' + remotePath);
        console.log('   🔐 Permisos establecidos a 644 (lectura pública)');
      } catch (error) {
        console.log('   ⚠️ No se pudieron establecer permisos automáticamente:', error.message);
      }

      // Construir URL pública
      const baseUrl = this.configService.get('FRONTEND_URL') || 'https://www.logolate.com';
      const publicUrl = `${baseUrl}/uploads/${folder}/${filename}`;

      console.log('✅ IMAGEN SUBIDA EXITOSAMENTE');
      console.log('   URL pública:', publicUrl);
      console.log('   Ruta FTP:', remotePath);
      return publicUrl;

    } catch (error) {
      console.error('❌ ERROR AL SUBIR IMAGEN A HOSTINGER');
      console.error('   Tipo de error:', error.constructor.name);
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      throw new Error(`Failed to upload image to Hostinger: ${error.message}`);
    } finally {
      console.log('🔌 Cerrando conexión FTP');
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
