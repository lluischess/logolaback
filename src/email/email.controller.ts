import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EmailService, EmailData, PresupuestoEmailData } from './email.service';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Endpoint para enviar email genérico
   */
  @Post('send')
  async sendEmail(@Body() emailData: EmailData) {
    try {
      this.logger.log(`📧 [EMAIL-CONTROLLER] Solicitud de envío de email a: ${emailData.to}`);
      
      const result = await this.emailService.sendEmail(emailData);
      
      this.logger.log(`✅ [EMAIL-CONTROLLER] Email enviado exitosamente`);
      return {
        success: true,
        message: 'Email enviado correctamente',
        data: result,
      };
    } catch (error) {
      this.logger.error(`❌ [EMAIL-CONTROLLER] Error enviando email:`, error);
      return {
        success: false,
        message: 'Error enviando email',
        error: error.message,
      };
    }
  }

  /**
   * Endpoint para enviar emails de nuevo presupuesto
   */
  @Post('send-presupuesto-notifications')
  async sendPresupuestoNotifications(@Body() data: PresupuestoEmailData) {
    try {
      this.logger.log(`📧 [EMAIL-CONTROLLER] Enviando notificaciones de presupuesto #${data.presupuesto.numeroPresupuesto}`);
      
      const results = await this.emailService.sendNewPresupuestoEmails(data);
      
      this.logger.log(`✅ [EMAIL-CONTROLLER] Notificaciones de presupuesto procesadas`);
      return {
        success: true,
        message: 'Notificaciones de presupuesto enviadas',
        data: results,
      };
    } catch (error) {
      this.logger.error(`❌ [EMAIL-CONTROLLER] Error enviando notificaciones de presupuesto:`, error);
      return {
        success: false,
        message: 'Error enviando notificaciones de presupuesto',
        error: error.message,
      };
    }
  }
}
