import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ConfigurationType } from '../interfaces/configuration.interface';

export type ConfigurationDocument = Configuration & Document;

@Schema({ timestamps: true })
export class Configuration {
  @Prop({ 
    required: true, 
    enum: Object.values(ConfigurationType),
    index: true 
  })
  tipo: ConfigurationType;

  @Prop({ required: true, maxlength: 100 })
  nombre: string;

  @Prop({ 
    required: true, 
    type: Object 
  })
  datos: any; // Puede ser SeoSettings, FooterSettings, GeneralSettings, BannerConfig o ImageUpload

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: Date.now })
  fechaActualizacion: Date;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

// Índices para optimizar consultas
ConfigurationSchema.index({ tipo: 1, activo: 1 });
ConfigurationSchema.index({ nombre: 1 });
ConfigurationSchema.index({ 'datos.ordenBanner': 1 }); // Para ordenar banners

// Middleware para actualizar fechaActualizacion
ConfigurationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date();
  }
  next();
});

// Middleware para validar estructura de datos según tipo
ConfigurationSchema.pre('save', function(next) {
  const config = this as ConfigurationDocument;
  
  try {
    switch (config.tipo) {
      case ConfigurationType.SEO:
        validateSeoSettings(config.datos);
        break;
      case ConfigurationType.FOOTER:
        validateFooterSettings(config.datos);
        break;
      case ConfigurationType.GENERAL:
        validateGeneralSettings(config.datos);
        break;
      case ConfigurationType.BANNERS:
        validateBannerConfig(config.datos);
        break;
      case ConfigurationType.IMAGES:
        validateImageUpload(config.datos);
        break;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Funciones de validación
function validateSeoSettings(datos: any) {
  const required = ['tituloPaginaPrincipal', 'metaDescripcionPrincipal', 'palabrasClave', 'nombreSitio'];
  for (const field of required) {
    if (!datos[field]) {
      throw new Error(`Campo requerido faltante en SEO: ${field}`);
    }
  }
}

function validateFooterSettings(datos: any) {
  const required = ['telefono', 'email', 'direccion', 'horarioAtencion'];
  for (const field of required) {
    if (!datos[field]) {
      throw new Error(`Campo requerido faltante en Footer: ${field}`);
    }
  }
}

function validateGeneralSettings(datos: any) {
  const required = ['logoHeader'];
  for (const field of required) {
    if (!datos[field]) {
      throw new Error(`Campo requerido faltante en General: ${field}`);
    }
  }
  
  // Validar email de administración si está presente
  if (datos.emailAdministracion && typeof datos.emailAdministracion !== 'string') {
    throw new Error('El campo emailAdministracion debe ser una cadena de texto');
  }
  
  if (datos.emailAdministracion && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.emailAdministracion)) {
    throw new Error('El campo emailAdministracion debe tener un formato de email válido');
  }
}

function validateBannerConfig(datos: any) {
  // Solo validar campos realmente obligatorios
  const required = ['titulo', 'ordenBanner'];
  for (const field of required) {
    if (datos[field] === undefined || datos[field] === null) {
      throw new Error(`Campo requerido faltante en Banner: ${field}`);
    }
  }
  
  if (typeof datos.ordenBanner !== 'number' || datos.ordenBanner < 1) {
    throw new Error('El orden del banner debe ser un número mayor a 0');
  }
  
  // Validaciones opcionales para campos que pueden estar presentes
  if (datos.imagenDesktop !== undefined && typeof datos.imagenDesktop !== 'string') {
    throw new Error('El campo imagenDesktop debe ser una cadena de texto');
  }
  
  if (datos.enlaceButton !== undefined && typeof datos.enlaceButton !== 'string') {
    throw new Error('El campo enlaceButton debe ser una cadena de texto');
  }
  
  if (datos.nombreButton !== undefined && typeof datos.nombreButton !== 'string') {
    throw new Error('El campo nombreButton debe ser una cadena de texto');
  }
  
  if (datos.colorBoton !== undefined && typeof datos.colorBoton !== 'string') {
    throw new Error('El campo colorBoton debe ser una cadena de texto');
  }
  
  if (datos.colorTitulos !== undefined && typeof datos.colorTitulos !== 'string') {
    throw new Error('El campo colorTitulos debe ser una cadena de texto');
  }
  
  // Validaciones para segundo botón opcional
  if (datos.enlaceButton2 !== undefined && typeof datos.enlaceButton2 !== 'string') {
    throw new Error('El campo enlaceButton2 debe ser una cadena de texto');
  }
  
  if (datos.nombreButton2 !== undefined && typeof datos.nombreButton2 !== 'string') {
    throw new Error('El campo nombreButton2 debe ser una cadena de texto');
  }
  
  if (datos.colorBoton2 !== undefined && typeof datos.colorBoton2 !== 'string') {
    throw new Error('El campo colorBoton2 debe ser una cadena de texto');
  }
}

function validateImageUpload(datos: any) {
  const required = ['nombre', 'nombreOriginal', 'ruta', 'tipo', 'tamaño'];
  for (const field of required) {
    if (!datos[field]) {
      throw new Error(`Campo requerido faltante en Image: ${field}`);
    }
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/ico'];
  if (!allowedTypes.includes(datos.tipo)) {
    throw new Error('Tipo de imagen no permitido');
  }
  
  const maxSize = 7 * 1024 * 1024; // 7MB
  if (datos.tamaño > maxSize) {
    throw new Error('El tamaño de la imagen excede el límite de 7MB');
  }
}
