import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true, maxlength: 100 })
  nombre: string;

  @Prop({ required: false, maxlength: 500 })
  descripcion?: string;

  @Prop({ required: true, unique: true, min: 1 })
  orden: number;

  @Prop({ default: true })
  publicado: boolean;

  @Prop({ default: false })
  configuracionEspecial: boolean; // Para marcar si aparece en novedades de la home

  // Campos SEO
  @Prop({ maxlength: 60 })
  metaTitulo?: string;

  @Prop({ maxlength: 160 })
  metaDescripcion?: string;

  @Prop({ maxlength: 200 })
  palabrasClave?: string;

  @Prop({ unique: true, lowercase: true })
  urlSlug?: string;

  // Open Graph
  @Prop({ maxlength: 60 })
  ogTitulo?: string;

  @Prop({ maxlength: 160 })
  ogDescripcion?: string;

  @Prop({ maxlength: 200 })
  ogImagen?: string;

  // Timestamps automáticos
  createdAt?: Date;
  updatedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Middleware para generar URL slug automáticamente
CategorySchema.pre('save', function(next) {
  if (this.isModified('nombre') || this.isNew) {
    this.urlSlug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  }

  // Auto-generar meta título si no existe
  if (!this.metaTitulo && this.nombre) {
    this.metaTitulo = this.nombre;
  }

  next();
});

// Índices para optimizar consultas
CategorySchema.index({ nombre: 1 });
CategorySchema.index({ urlSlug: 1 });
CategorySchema.index({ orden: 1 });
CategorySchema.index({ publicado: 1 });
CategorySchema.index({ configuracionEspecial: 1 });
