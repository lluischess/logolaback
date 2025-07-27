export interface BudgetProduct {
  productId: string;
  nombre: string;
  referencia: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface ClientData {
  email: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  detalles?: string; // Explicación del cliente sobre sus necesidades
}

export enum BudgetStatus {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  ENVIADO = 'enviado',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado'
}

export interface StatusHistory {
  estado: BudgetStatus;
  fecha: Date;
  notas?: string;
  usuarioId?: string;
}

export interface EmailNotification {
  tipo: 'cliente' | 'admin';
  enviado: boolean;
  fechaEnvio?: Date;
  error?: string;
}
