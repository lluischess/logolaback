import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BudgetProduct, ClientData, BudgetStatus, StatusHistory, EmailNotification } from '../interfaces/budget.interface';

export type BudgetDocument = Budget & Document;

@Schema({ timestamps: true })
export class Budget {
  @Prop({ unique: true })
  numeroPedido: string;

  @Prop({ type: Number, unique: true })
  numeroPresupuesto: number;

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

  // Productos del presupuesto (solo referencias + datos específicos del presupuesto)
  @Prop({
    type: [{
      productId: { type: String, required: true }, // Referencia al producto en la tabla productos
      cantidad: { type: Number, required: true, min: 1 },
      precioUnitario: { type: Number, required: true, min: 0 } // Precio específico del presupuesto (editable)
      // NO almacenar: nombre, imagen, categoria (se obtienen por JOIN con tabla productos)
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

  // Observaciones del cliente
  @Prop({ required: false, maxlength: 600 })
  observaciones?: string;

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

// Middleware para generar número de pedido y número de presupuesto automáticamente
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

    // Generar número de presupuesto autonumérico
    const maxNumeroPresupuesto = await (this.constructor as any)
      .findOne({}, { numeroPresupuesto: 1 })
      .sort({ numeroPresupuesto: -1 })
      .exec();
    
    this.numeroPresupuesto = maxNumeroPresupuesto ? maxNumeroPresupuesto.numeroPresupuesto + 1 : 1;

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
BudgetSchema.index({ numeroPresupuesto: -1 }); // Ordenamiento descendente por defecto
BudgetSchema.index({ 'cliente.email': 1 });
BudgetSchema.index({ estado: 1 });
BudgetSchema.index({ createdAt: -1 });
BudgetSchema.index({ fechaVencimiento: 1 });
