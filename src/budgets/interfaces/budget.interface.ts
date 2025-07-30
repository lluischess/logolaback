export interface BudgetProduct {
  productId: string;         // Referencia al ID del producto en la tabla productos
  cantidad: number;          // Cantidad solicitada en el presupuesto
  precioUnitario: number;    // Precio específico del presupuesto (editable, independiente del precio del producto)
  // Los siguientes campos se obtienen por JOIN con la tabla productos:
  // - nombre, imagen, categoria (no se almacenan aquí)
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
