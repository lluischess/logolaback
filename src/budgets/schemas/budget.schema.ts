import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BudgetProduct, ClientData, BudgetStatus, StatusHistory, EmailNotification } from '../interfaces/budget.interface';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ unique: true })
  numeroPedido: string;

  // Datos del cliente
  @Prop({ 
    type: {
      email: { type: String, required: true },
      nombre: { type: String, required: true },
      telefono: { type: String, required: false },
      direccion: { type: String, required: false },
      empresa: { type: String, required: false },
      detalles: { type: String, required: false, maxlength: 1000 }
    },
    required: true 
  })
  cliente: ClientData;

  // Productos del presupuesto
  @Prop({
    type: [{
      productId: { type: String, required: true },
      nombre: { type: String, required: true },
      referencia: { type: String, required: true },
      cantidad: { type: Number, required: true, min: 1 },
      precioUnitario: { type: Number, required: false, min: 0 },
      subtotal: { type: Number, required: false, min: 0 }
    }],
    required: true
  })
  productos: BudgetProduct[];

  // Estado del presupuesto
  @Prop({ 
    type: String, 
    enum: Object.values(BudgetStatus),
    default: BudgetStatus.PENDIENTE 
  })
  estado: BudgetStatus;

  // Historial de estados
  @Prop({
    type: [{
      estado: { type: String, enum: Object.values(BudgetStatus), required: true },
      fecha: { type: Date, default: Date.now },
      notas: { type: String, required: false },
      usuarioId: { type: String, required: false }
    }],
    default: []
  })
  historialEstados: StatusHistory[];

  // Logotipo de la empresa del cliente
  @Prop({ required: false, maxlength: 500 })
  logotipoEmpresa?: string;

  // Acepta correos publicitarios
  @Prop({ default: false })
  aceptaCorreosPublicitarios: boolean;

  // Notas adicionales
  @Prop({ required: false, maxlength: 1000 })
  notas?: string;

  // Notas internas (solo para administradores)
  @Prop({ required: false, maxlength: 1000 })
  notasInternas?: string;

  // Precio total del presupuesto
  @Prop({ required: false, min: 0 })
  precioTotal?: number;

  // Fecha de vencimiento del presupuesto
  @Prop({ required: false })
  fechaVencimiento?: Date;

  // Sistema de notificaciones por email
  @Prop({
    type: {
      cliente: {
        enviado: { type: Boolean, default: false },
        fechaEnvio: { type: Date, required: false },
        error: { type: String, required: false }
      },
      admin: {
        enviado: { type: Boolean, default: false },
        fechaEnvio: { type: Date, required: false },
        error: { type: String, required: false }
      }
    },
    default: {
      cliente: { enviado: false },
      admin: { enviado: false }
    }
  })
  notificacionesEmail: {
    cliente: EmailNotification;
    admin: EmailNotification;
  };

  // Timestamps automáticos
  createdAt?: Date;
  updatedAt?: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);

// Middleware para generar número de pedido automáticamente
BudgetSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generar número de pedido único basado en fecha y contador
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Buscar el último presupuesto del día para generar contador
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const count = await (this.constructor as any).countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const counter = (count + 1).toString().padStart(3, '0');
    this.numeroPedido = `LOG-${year}${month}${day}-${counter}`;

    // Inicializar historial de estados
    this.historialEstados = [{
      estado: this.estado,
      fecha: new Date(),
      notas: 'Presupuesto creado'
    }];
  }

  next();
});

// Middleware para actualizar historial cuando cambia el estado
BudgetSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  if (update.estado && update.estado !== this.getQuery().estado) {
    if (!update.$push) {
      update.$push = {};
    }
    update.$push.historialEstados = {
      estado: update.estado,
      fecha: new Date(),
      notas: update.notasEstado || `Estado cambiado a ${update.estado}`
    };
  }
  
  next();
});

// Índices para optimizar consultas
BudgetSchema.index({ numeroPedido: 1 });
BudgetSchema.index({ 'cliente.email': 1 });
BudgetSchema.index({ estado: 1 });
BudgetSchema.index({ createdAt: -1 });
BudgetSchema.index({ fechaVencimiento: 1 });
