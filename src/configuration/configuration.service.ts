import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Configuration, ConfigurationDocument } from './schemas/configuration.schema';
import { ConfigurationType } from './interfaces/configuration.interface';
import {
  CreateSeoConfigDto,
  CreateFooterConfigDto,
  CreateGeneralConfigDto,
  CreateBannerConfigDto,
  CreateImageUploadDto,
  QueryConfigurationDto,
  UpdateConfigurationDto
} from './dto';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectModel(Configuration.name) private configurationModel: Model<ConfigurationDocument>,
  ) {}

  // ==================== CONFIGURACIÓN SEO ====================
  async createSeoConfig(createSeoConfigDto: CreateSeoConfigDto): Promise<Configuration> {
    // Solo puede haber una configuración SEO activa
    await this.configurationModel.updateMany(
      { tipo: ConfigurationType.SEO },
      { activo: false }
    );

    const seoConfig = new this.configurationModel({
      tipo: ConfigurationType.SEO,
      nombre: 'Configuración SEO Principal',
      datos: createSeoConfigDto,
      activo: true
    });

    const result = await seoConfig.save();
    console.log(`[ConfigurationService] Configuración SEO creada/actualizada`);
    return result;
  }

  async getSeoConfig(): Promise<Configuration> {
    const config = await this.configurationModel.findOne({
      tipo: ConfigurationType.SEO,
      activo: true
    });

    if (!config) {
      throw new NotFoundException('Configuración SEO no encontrada');
    }

    return config;
  }

  // Alias para actualización (usa la misma lógica que create)
  async updateSeoConfig(createSeoConfigDto: CreateSeoConfigDto): Promise<Configuration> {
    return this.createSeoConfig(createSeoConfigDto);
  }

  // ==================== CONFIGURACIÓN FOOTER ====================
  async createFooterConfig(createFooterConfigDto: CreateFooterConfigDto): Promise<Configuration> {
    // Solo puede haber una configuración Footer activa
    await this.configurationModel.updateMany(
      { tipo: ConfigurationType.FOOTER },
      { activo: false }
    );

    const footerConfig = new this.configurationModel({
      tipo: ConfigurationType.FOOTER,
      nombre: 'Configuración Footer Principal',
      datos: createFooterConfigDto,
      activo: true
    });

    const result = await footerConfig.save();
    console.log(`[ConfigurationService] Configuración Footer creada/actualizada`);
    return result;
  }

  async getFooterConfig(): Promise<Configuration> {
    const config = await this.configurationModel.findOne({
      tipo: ConfigurationType.FOOTER,
      activo: true
    });

    if (!config) {
      throw new NotFoundException('Configuración Footer no encontrada');
    }

    return config;
  }

  // Alias para actualización (usa la misma lógica que create)
  async updateFooterConfig(createFooterConfigDto: CreateFooterConfigDto): Promise<Configuration> {
    return this.createFooterConfig(createFooterConfigDto);
  }

  // ==================== CONFIGURACIÓN GENERAL ====================
  async createGeneralConfig(createGeneralConfigDto: CreateGeneralConfigDto): Promise<Configuration> {
    // Solo puede haber una configuración General activa
    await this.configurationModel.updateMany(
      { tipo: ConfigurationType.GENERAL },
      { activo: false }
    );

    const generalConfig = new this.configurationModel({
      tipo: ConfigurationType.GENERAL,
      nombre: 'Configuración General Principal',
      datos: createGeneralConfigDto,
      activo: true
    });

    const result = await generalConfig.save();
    console.log(`[ConfigurationService] Configuración General creada/actualizada`);
    return result;
  }

  async getGeneralConfig(): Promise<Configuration> {
    const config = await this.configurationModel.findOne({
      tipo: ConfigurationType.GENERAL,
      activo: true
    });

    if (!config) {
      throw new NotFoundException('Configuración General no encontrada');
    }

    return config;
  }

  // Alias para actualización (usa la misma lógica que create)
  async updateGeneralConfig(createGeneralConfigDto: CreateGeneralConfigDto): Promise<Configuration> {
    return this.createGeneralConfig(createGeneralConfigDto);
  }

  // ==================== GESTIÓN DE BANNERS ====================
  
  async updateBannersConfig(bannersData: any): Promise<Configuration[]> {
    try {
      console.log('[ConfigurationService] === INICIO updateBannersConfig ===');
      console.log('[ConfigurationService] Datos recibidos:', JSON.stringify(bannersData, null, 2));
      
      // Paso 1: Verificar conexión a la base de datos
      console.log('[ConfigurationService] Paso 1: Verificando conexión a la base de datos...');
      const testQuery = await this.configurationModel.countDocuments();
      console.log(`[ConfigurationService] Conexión OK. Documentos en la colección: ${testQuery}`);
      
      // Paso 2: ELIMINAR banners existentes para evitar duplicación
      console.log('[ConfigurationService] Paso 2: Eliminando banners existentes...');
      const deleteResult = await this.configurationModel.deleteMany(
        { tipo: ConfigurationType.BANNERS }
      );
      console.log(`[ConfigurationService] Banners eliminados: ${deleteResult.deletedCount}`);

      const results: Configuration[] = [];
      
      // Paso 3: Validar datos de entrada
      if (!bannersData || !bannersData.banners) {
        console.log('[ConfigurationService] No hay datos de banners para procesar');
        return results;
      }
      
      if (!Array.isArray(bannersData.banners)) {
        console.error('[ConfigurationService] bannersData.banners no es un array:', typeof bannersData.banners);
        throw new Error('Los datos de banners deben ser un array');
      }
      
      console.log(`[ConfigurationService] Paso 3: Procesando ${bannersData.banners.length} banners...`);
      
      // Paso 4: Procesar cada banner individualmente
      for (let i = 0; i < bannersData.banners.length; i++) {
        const bannerData = bannersData.banners[i];
        console.log(`[ConfigurationService] Procesando banner ${i + 1}:`, JSON.stringify(bannerData, null, 2));
        
        try {
          // Crear objeto de configuración mínimo para testing
          const bannerConfig = {
            tipo: ConfigurationType.BANNERS,
            nombre: `Banner ${bannerData.titulo || 'Sin título'} - ${Date.now()}`,
            datos: {
              titulo: bannerData.titulo || '',
              subtitulo: bannerData.subtitulo || '',
              imagen: bannerData.imagen || '',
              imagenMobile: bannerData.imagenMobile || '',
              enlace: bannerData.enlace || '',
              activo: bannerData.activo !== undefined ? bannerData.activo : true,
              ordenBanner: bannerData.orden || (i + 1)
            },
            activo: true
          };
          
          console.log(`[ConfigurationService] Objeto a guardar:`, JSON.stringify(bannerConfig, null, 2));
          
          const newBanner = new this.configurationModel(bannerConfig);
          console.log(`[ConfigurationService] Modelo creado, guardando...`);
          
          const result = await newBanner.save();
          results.push(result);
          console.log(`[ConfigurationService] Banner ${i + 1} guardado correctamente con ID: ${result._id}`);
          
        } catch (bannerError) {
          console.error(`[ConfigurationService] ERROR al guardar banner ${i + 1}:`);
          console.error(`[ConfigurationService] Error name: ${bannerError.name}`);
          console.error(`[ConfigurationService] Error message: ${bannerError.message}`);
          console.error(`[ConfigurationService] Error stack:`, bannerError.stack);
          throw bannerError;
        }
      }
      
      console.log(`[ConfigurationService] === FIN updateBannersConfig === Guardados: ${results.length} banners`);
      return results;
      
    } catch (error) {
      console.error('[ConfigurationService] === ERROR GENERAL en updateBannersConfig ===');
      console.error(`[ConfigurationService] Error name: ${error.name}`);
      console.error(`[ConfigurationService] Error message: ${error.message}`);
      console.error(`[ConfigurationService] Error stack:`, error.stack);
      throw error;
    }
  }
  async createBanner(createBannerConfigDto: CreateBannerConfigDto): Promise<Configuration> {
    // Verificar que no exista otro banner con el mismo orden
    const existingBanner = await this.configurationModel.findOne({
      tipo: ConfigurationType.BANNERS,
      'datos.ordenBanner': createBannerConfigDto.ordenBanner,
      activo: true
    });

    if (existingBanner) {
      throw new BadRequestException(`Ya existe un banner con el orden ${createBannerConfigDto.ordenBanner}`);
    }

    const bannerConfig = new this.configurationModel({
      tipo: ConfigurationType.BANNERS,
      nombre: `Banner - ${createBannerConfigDto.titulo}`,
      datos: {
        ...createBannerConfigDto,
        activo: createBannerConfigDto.activo ?? true
      },
      activo: true
    });

    const result = await bannerConfig.save();
    console.log(`[ConfigurationService] Banner creado: ${createBannerConfigDto.titulo}`);
    return result;
  }

  async getBanners(activo?: boolean): Promise<Configuration[]> {
    const filter: any = { tipo: ConfigurationType.BANNERS };
    if (activo !== undefined) {
      filter['datos.activo'] = activo;
    }

    const banners = await this.configurationModel
      .find(filter)
      .sort({ 'datos.ordenBanner': 1 })
      .exec();

    return banners;
  }

  async updateBanner(id: string, updateData: any): Promise<Configuration> {
    // Si se está actualizando el orden, verificar que no exista conflicto
    if (updateData.ordenBanner) {
      const existingBanner = await this.configurationModel.findOne({
        _id: { $ne: id },
        tipo: ConfigurationType.BANNERS,
        'datos.ordenBanner': updateData.ordenBanner,
        activo: true
      });

      if (existingBanner) {
        throw new BadRequestException(`Ya existe un banner con el orden ${updateData.ordenBanner}`);
      }
    }

    const banner = await this.configurationModel.findById(id);
    if (!banner) {
      throw new NotFoundException('Banner no encontrado');
    }

    // Actualizar datos
    banner.datos = { ...banner.datos, ...updateData };
    banner.nombre = `Banner - ${banner.datos.titulo}`;
    
    const result = await banner.save();
    console.log(`[ConfigurationService] Banner actualizado: ${id}`);
    return result;
  }

  async deleteBanner(id: string): Promise<void> {
    const result = await this.configurationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Banner no encontrado');
    }
    console.log(`[ConfigurationService] Banner eliminado: ${id}`);
  }

  async reorderBanners(bannerId: string, newOrder: number): Promise<Configuration[]> {
    const banner = await this.configurationModel.findById(bannerId);
    if (!banner) {
      throw new NotFoundException('Banner no encontrado');
    }

    const currentOrder = banner.datos.ordenBanner;

    if (currentOrder === newOrder) {
      return this.getBanners(true);
    }

    // Reordenar otros banners
    if (newOrder > currentOrder) {
      // Mover hacia abajo - decrementar orden de banners intermedios
      await this.configurationModel.updateMany(
        {
          tipo: ConfigurationType.BANNERS,
          'datos.ordenBanner': { $gt: currentOrder, $lte: newOrder }
        },
        { $inc: { 'datos.ordenBanner': -1 } }
      );
    } else {
      // Mover hacia arriba - incrementar orden de banners intermedios
      await this.configurationModel.updateMany(
        {
          tipo: ConfigurationType.BANNERS,
          'datos.ordenBanner': { $gte: newOrder, $lt: currentOrder }
        },
        { $inc: { 'datos.ordenBanner': 1 } }
      );
    }

    // Actualizar el banner actual
    banner.datos.ordenBanner = newOrder;
    await banner.save();

    console.log(`[ConfigurationService] Banner reordenado: ${bannerId} a posición ${newOrder}`);
    return this.getBanners(true);
  }

  // ==================== GESTIÓN DE IMÁGENES ====================
  async uploadImage(createImageUploadDto: CreateImageUploadDto): Promise<Configuration> {
    const imageConfig = new this.configurationModel({
      tipo: ConfigurationType.IMAGES,
      nombre: createImageUploadDto.nombre,
      datos: {
        ...createImageUploadDto,
        fechaSubida: new Date()
      },
      activo: true
    });

    const result = await imageConfig.save();
    console.log(`[ConfigurationService] Imagen subida: ${createImageUploadDto.nombre}`);
    return result;
  }

  async getImages(query: QueryConfigurationDto): Promise<{ images: Configuration[], total: number }> {
    const filter: any = { tipo: ConfigurationType.IMAGES };

    if (query.buscar) {
      filter.$or = [
        { nombre: { $regex: query.buscar, $options: 'i' } },
        { 'datos.nombreOriginal': { $regex: query.buscar, $options: 'i' } },
        { 'datos.descripcion': { $regex: query.buscar, $options: 'i' } }
      ];
    }

    const total = await this.configurationModel.countDocuments(filter);
    const skip = (query.pagina - 1) * query.limite;

    const images = await this.configurationModel
      .find(filter)
      .sort({ [query.ordenarPor]: query.orden === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(query.limite)
      .exec();

    return { images, total };
  }

  async deleteImage(id: string): Promise<void> {
    const result = await this.configurationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Imagen no encontrada');
    }
    console.log(`[ConfigurationService] Imagen eliminada: ${id}`);
  }

  // ==================== MÉTODOS GENERALES ====================
  async findAll(query: QueryConfigurationDto): Promise<{ configurations: Configuration[], total: number }> {
    const filter: any = {};

    if (query.tipo) {
      filter.tipo = query.tipo;
    }

    if (query.activo !== undefined) {
      filter.activo = query.activo;
    }

    if (query.nombre) {
      filter.nombre = { $regex: query.nombre, $options: 'i' };
    }

    if (query.buscar) {
      filter.$or = [
        { nombre: { $regex: query.buscar, $options: 'i' } },
        { 'datos.titulo': { $regex: query.buscar, $options: 'i' } },
        { 'datos.tituloPaginaPrincipal': { $regex: query.buscar, $options: 'i' } }
      ];
    }

    const total = await this.configurationModel.countDocuments(filter);
    const skip = (query.pagina - 1) * query.limite;

    const configurations = await this.configurationModel
      .find(filter)
      .sort({ [query.ordenarPor]: query.orden === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(query.limite)
      .exec();

    return { configurations, total };
  }

  async findOne(id: string): Promise<Configuration> {
    const configuration = await this.configurationModel.findById(id);
    if (!configuration) {
      throw new NotFoundException('Configuración no encontrada');
    }
    return configuration;
  }

  async update(id: string, updateConfigurationDto: UpdateConfigurationDto): Promise<Configuration> {
    const configuration = await this.configurationModel.findById(id);
    if (!configuration) {
      throw new NotFoundException('Configuración no encontrada');
    }

    if (updateConfigurationDto.datos) {
      configuration.datos = { ...configuration.datos, ...updateConfigurationDto.datos };
    }

    if (updateConfigurationDto.activo !== undefined) {
      configuration.activo = updateConfigurationDto.activo;
    }

    const result = await configuration.save();
    console.log(`[ConfigurationService] Configuración actualizada: ${id}`);
    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.configurationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Configuración no encontrada');
    }
    console.log(`[ConfigurationService] Configuración eliminada: ${id}`);
  }

  // ==================== ESTADÍSTICAS ====================
  async getStats(): Promise<any> {
    const stats = await this.configurationModel.aggregate([
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 },
          activos: { $sum: { $cond: ['$activo', 1, 0] } }
        }
      }
    ]);

    const totalImages = await this.configurationModel.countDocuments({ tipo: ConfigurationType.IMAGES });
    const totalBanners = await this.configurationModel.countDocuments({ tipo: ConfigurationType.BANNERS });
    const activeBanners = await this.configurationModel.countDocuments({ 
      tipo: ConfigurationType.BANNERS, 
      'datos.activo': true 
    });

    return {
      porTipo: stats,
      resumen: {
        totalConfiguraciones: await this.configurationModel.countDocuments(),
        totalImagenes: totalImages,
        totalBanners: totalBanners,
        bannersActivos: activeBanners
      }
    };
  }
}
