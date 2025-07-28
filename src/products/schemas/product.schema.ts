import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ unique: true, index: true })
  numeroProducto: number;

  @Prop({ required: true, trim: true, maxlength: 100 })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true, maxlength: 50 })
  referencia: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  descripcion: string;

  @Prop({ 
    required: true, 
    enum: ['grande', 'mediano', 'pequeño'],
    default: 'mediano'
  })
  talla: string;

  @Prop({ 
    required: true, 
    enum: ['chocolates', 'caramelos', 'novedades', 'navidad', 'galletas', 'hoteles', 'bombones', 'minibar'],
    index: true
  })
  categoria: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  medidas: string;

  @Prop({ 
    type: [String], 
    validate: {
      validator: function(v: string[]) {
        return v.length <= 3;
      },
      message: 'Máximo 3 imágenes permitidas'
    },
    default: []
  })
  imagenes: string[];

  @Prop({ required: true, trim: true, maxlength: 500 })
  ingredientes: string;

  @Prop({ trim: true, maxlength: 1000 })
  masDetalles: string;

  @Prop({ required: true, min: 1, max: 10000 })
  cantidadMinima: number;

  @Prop({ min: 0 })
  precio: number;

  @Prop({ required: true, min: 1, index: true })
  ordenCategoria: number;

  @Prop({ default: true, index: true })
  publicado: boolean;

  @Prop({ trim: true })
  consumePreferente: string;

  // SEO Fields
  @Prop({ trim: true, maxlength: 60 })
  metaTitulo: string;

  @Prop({ trim: true, maxlength: 160 })
  metaDescripcion: string;

  @Prop({ trim: true, maxlength: 200 })
  palabrasClave: string;

  @Prop({ trim: true, maxlength: 100, unique: true })
  urlSlug: string;

  @Prop({ trim: true, maxlength: 60 })
  ogTitulo: string;

  @Prop({ trim: true, maxlength: 160 })
  ogDescripcion: string;

  @Prop({ trim: true })
  ogImagen: string;

  // Timestamps automáticos por el schema
  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índices compuestos para optimizar consultas
ProductSchema.index({ categoria: 1, ordenCategoria: 1 });
ProductSchema.index({ publicado: 1, categoria: 1 });
ProductSchema.index({ nombre: 'text', descripcion: 'text', ingredientes: 'text' });

// Middleware para generar URL slug automáticamente y autonumeración
ProductSchema.pre('save', async function(next) {
  // Auto-generar número de producto si es un documento nuevo
  if (this.isNew && !this.numeroProducto) {
    try {
      const lastProduct = await this.model('Product').findOne({}).sort({ numeroProducto: -1 }).exec() as any;
      this.numeroProducto = lastProduct ? (lastProduct.numeroProducto + 1) : 1;
    } catch (error) {
      return next(error);
    }
  }
  
  if (this.isModified('nombre') && !this.urlSlug) {
    this.urlSlug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Auto-generar meta título si no existe
  if (this.isModified('nombre') && !this.metaTitulo) {
    this.metaTitulo = this.nombre.substring(0, 60);
  }
  
  next();
});
