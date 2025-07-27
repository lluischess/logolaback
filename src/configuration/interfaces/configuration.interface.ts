// Interfaces para el módulo de configuración

// Configuraciones SEO
export interface SeoSettings {
  tituloPaginaPrincipal: string;
  metaDescripcionPrincipal: string;
  palabrasClave: string;
  nombreSitio: string;
  imagenPorDefecto: string;
}

// Configuraciones del Footer
export interface FooterSettings {
  telefono: string;
  email: string;
  direccion: string;
  horarioAtencion: string;
  contenidoFooter: string;
  tituloContenidoFooter: string;
  instagram: string;
}

// Configuraciones Generales
export interface GeneralSettings {
  logoHeader: string;
  logoFooter: string;
  favicon: string;
}

// Configuración de Banner
export interface BannerConfig {
  titulo: string;
  subtitulo: string;
  imagenDesktop: string;
  imagenMobile: string;
  enlaceButton: string;
  nombreButton: string;
  ordenBanner: number;
  colorBoton: string;
  colorTitulos: string;
  activo: boolean;
}

// Configuración de Imagen subida
export interface ImageUpload {
  nombre: string;
  nombreOriginal: string;
  ruta: string;
  tipo: string;
  tamaño: number;
  fechaSubida: Date;
  descripcion?: string;
}

// Tipos de configuración
export enum ConfigurationType {
  SEO = 'seo',
  FOOTER = 'footer', 
  GENERAL = 'general',
  BANNERS = 'banners',
  IMAGES = 'images'
}

// Interface principal de configuración
export interface Configuration {
  _id?: string;
  tipo: ConfigurationType;
  nombre: string;
  datos: SeoSettings | FooterSettings | GeneralSettings | BannerConfig | ImageUpload;
  activo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}
