import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface PresupuestoEmailData {
  presupuesto: {
    id: string;
    numeroPresupuesto: string;
    fechaCreacion: string;
    estado: string;
    total: number;
    cliente: {
      nombre: string;
      email: string;
      telefono?: string;
      empresa?: string;
    };
    productos: Array<{
      nombre: string;
      cantidad: number;
      precio: number;
      subtotal: number;
    }>;
  };
  emailAdministracion: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configuración para Hostinger SMTP
    this.transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Error configurando transporter de email:', error);
      } else {
        this.logger.log('✅ Servidor de email configurado correctamente');
      }
    });
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(emailData: EmailData): Promise<any> {
    try {
      this.logger.log(`📧 Enviando email a: ${emailData.to}`);
      
      const mailOptions = {
        from: emailData.from || this.configService.get('EMAIL_FROM', 'noreply@logolate.com'),
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email enviado exitosamente a ${emailData.to}`);
      
      return {
        success: true,
        messageId: result.messageId,
        to: emailData.to,
        subject: emailData.subject,
      };
    } catch (error) {
      this.logger.error(`❌ Error enviando email a ${emailData.to}:`, error);
      throw error;
    }
  }

  /**
   * Enviar notificaciones de nuevo presupuesto (admin + cliente)
   */
  async sendNewPresupuestoEmails(data: PresupuestoEmailData): Promise<any> {
    this.logger.log('📧 === ENVIANDO EMAILS DE NUEVO PRESUPUESTO ===');
    
    const results = {
      admin: null,
      cliente: null,
      errors: [],
    };

    try {
      // Email al administrador
      const adminEmailData: EmailData = {
        to: data.emailAdministracion,
        subject: `🆕 Nuevo Presupuesto #${data.presupuesto.numeroPresupuesto} - Logolate`,
        html: this.generateAdminNotificationTemplate(data.presupuesto),
      };

      results.admin = await this.sendEmail(adminEmailData);
      this.logger.log('✅ Email al administrador enviado');

    } catch (error) {
      this.logger.error('❌ Error enviando email al administrador:', error);
      results.errors.push({ type: 'admin', error: error.message });
    }

    try {
      // Email al cliente
      const clienteEmailData: EmailData = {
        to: data.presupuesto.cliente.email,
        subject: `✅ Confirmación de Presupuesto #${data.presupuesto.numeroPresupuesto} - Logolate`,
        html: this.generateClientConfirmationTemplate(data.presupuesto),
      };

      results.cliente = await this.sendEmail(clienteEmailData);
      this.logger.log('✅ Email al cliente enviado');

    } catch (error) {
      this.logger.error('❌ Error enviando email al cliente:', error);
      results.errors.push({ type: 'cliente', error: error.message });
    }

    return results;
  }

  /**
   * Template HTML para notificación al administrador
   */
  private generateAdminNotificationTemplate(presupuesto: any): string {
    const productosHtml = presupuesto.productos
      .map(p => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: left;">${p.nombre}</td>
          <td style="padding: 12px; text-align: center;">${p.cantidad}</td>
        </tr>
      `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Presupuesto - Logolate</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🆕 Nuevo Presupuesto</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Presupuesto #${presupuesto.numeroPresupuesto}</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #8B4513; margin-top: 0;">📋 Información del Cliente</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 5px 0;"><strong>👤 Nombre:</strong> ${presupuesto.cliente.nombre}</p>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${presupuesto.cliente.email}</p>
            ${presupuesto.cliente.telefono ? `<p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> ${presupuesto.cliente.telefono}</p>` : ''}
            ${presupuesto.cliente.empresa ? `<p style="margin: 5px 0;"><strong>🏢 Empresa:</strong> ${presupuesto.cliente.empresa}</p>` : ''}
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES')}</p>
          </div>

          <h2 style="color: #8B4513;">🛍️ Productos Solicitados</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #8B4513; color: white;">
                <th style="padding: 15px; text-align: left;">Producto</th>
                <th style="padding: 15px; text-align: center;">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${productosHtml}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>Este email fue generado automáticamente por el sistema de Logolate</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para confirmación al cliente
   */
  private generateClientConfirmationTemplate(presupuesto: any): string {
    const productosHtml = presupuesto.productos
      .map(p => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: left;">${p.nombre}</td>
          <td style="padding: 12px; text-align: center;">${p.cantidad}</td>
        </tr>
      `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Presupuesto - Logolate</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Presupuesto Recibido</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Gracias por confiar en Logolate</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 25px;">Estimado/a <strong>${presupuesto.cliente.nombre}</strong>,</p>
          
          <p style="margin-bottom: 25px;">Hemos recibido correctamente su solicitud de presupuesto. A continuación encontrará un resumen de los productos solicitados:</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #8B4513; margin-top: 0;">📋 Resumen del Presupuesto</h3>
            <p style="margin: 5px 0;"><strong>📄 Número:</strong> #${presupuesto.numeroPresupuesto}</p>
            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES')}</p>
          </div>

          <h3 style="color: #8B4513;">🛍️ Productos Solicitados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #8B4513; color: white;">
                <th style="padding: 15px; text-align: left;">Producto</th>
                <th style="padding: 15px; text-align: center;">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${productosHtml}
            </tbody>
          </table>

          <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0;">⏰ ¿Qué sigue ahora?</h3>
            <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
              <li><strong>Revisión:</strong> Nuestro equipo revisará su solicitud</li>
              <li><strong>Contacto:</strong> Nos pondremos en contacto en las próximas 24-48 horas</li>
              <li><strong>Propuesta:</strong> Le enviaremos una cotización detallada y personalizada</li>
            </ul>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="color: #8B4513; margin: 0 0 15px 0;">📞 ¿Necesita ayuda?</h3>
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> info@logolate.com</p>
            <p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> (+34) 938 612 5568</p>
            <p style="margin: 5px 0;"><strong>🕒 Horario:</strong> Lunes a Viernes de 9:00 a 18:00</p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>Gracias por elegir Logolate - Chocolates Personalizados de Calidad</p>
          <p>Este es un email automático, por favor no responda a este mensaje.</p>
        </div>
      </body>
      </html>
    `;
  }
}
