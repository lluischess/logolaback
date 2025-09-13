import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, QueryProductDto, ReorderProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Verificar que la referencia sea única
      const existingProduct = await this.productModel.findOne({ referencia: createProductDto.referencia });
      if (existingProduct) {
        throw new BadRequestException(`Ya existe un producto con la referencia: ${createProductDto.referencia}`);
      }

      // Si no se especifica orden, asignar el siguiente disponible en la categoría
      if (!createProductDto.ordenCategoria) {
        const maxOrder = await this.productModel
          .findOne({ categoria: createProductDto.categoria })
          .sort({ ordenCategoria: -1 })
          .select('ordenCategoria');
        
        createProductDto.ordenCategoria = maxOrder ? maxOrder.ordenCategoria + 1 : 1;
      }

      const createdProduct = new this.productModel(createProductDto);
      return await createdProduct.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`Ya existe un producto con este ${field}`);
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryProductDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'categoria',
      sortOrder = 'asc',
      search,
      ...filters
    } = queryDto;

    // Construir filtros
    const query: any = {};
    
    // Filtros específicos
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (key === 'id') {
          query._id = filters[key];
        } else {
          query[key] = filters[key];
        }
      }
    });

    // Búsqueda de texto
    if (search) {
      query.$text = { $search: search };
    }

    // Configurar ordenamiento
    const sortOptions: any = {};
    if (sortBy === 'categoria') {
      // Ordenamiento especial por categoría y luego por orden
      sortOptions.categoria = sortOrder === 'asc' ? 1 : -1;
      sortOptions.ordenCategoria = 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Ejecutar consulta con paginación
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel.findOne({ urlSlug: slug }).exec();
    if (!product) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }
    return product;
  }

  async findByCategory(categoriaSlugOrName: string): Promise<Product[]> {
    // Primero intentar buscar la categoría por slug
    const mongoose = require('mongoose');
    const Category = mongoose.model('Category');
    
    const category = await Category.findOne({
      $or: [
        { urlSlug: categoriaSlugOrName },
        { nombre: { $regex: new RegExp(`^${categoriaSlugOrName}$`, 'i') } }
      ],
      publicado: true
    });

    if (!category) {
      return [];
    }

    return await this.productModel
      .find({ categoria: category.nombre, publicado: true })
      .sort({ ordenCategoria: 1 })
      .exec();
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const trimmedSearchTerm = searchTerm.trim();
    
    // Buscar por nombre, referencia o categoría (case insensitive)
    const searchQuery = {
      publicado: true, // Solo productos publicados
      $or: [
        { nombre: { $regex: trimmedSearchTerm, $options: 'i' } },
        { referencia: { $regex: trimmedSearchTerm, $options: 'i' } },
        { categoria: { $regex: trimmedSearchTerm, $options: 'i' } }
      ]
    };

    return await this.productModel
      .find(searchQuery)
      .sort({ categoria: 1, ordenCategoria: 1 })
      .exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      // Si se actualiza la referencia, verificar que sea única
      if (updateProductDto.referencia) {
        const existingProduct = await this.productModel.findOne({ 
          referencia: updateProductDto.referencia,
          _id: { $ne: id }
        });
        if (existingProduct) {
          throw new BadRequestException(`Ya existe un producto con la referencia: ${updateProductDto.referencia}`);
        }
      }

      // Obtener el producto actual para comparar la categoría
      const currentProduct = await this.productModel.findById(id).exec();
      if (!currentProduct) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      // Si se está cambiando la categoría, recalcular el ordenCategoria
      if (updateProductDto.categoria && updateProductDto.categoria !== currentProduct.categoria) {
        console.log(`🔄 Cambiando categoría de "${currentProduct.categoria}" a "${updateProductDto.categoria}"`);
        
        // Calcular el siguiente orden para la nueva categoría
        const nextOrder = await this.getNextOrderForCategory(updateProductDto.categoria);
        updateProductDto.ordenCategoria = nextOrder;
        
        console.log(`✅ Nuevo ordenCategoria asignado: ${nextOrder}`);
      }

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .exec();
      
      if (!updatedProduct) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      
      return updatedProduct;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`Ya existe un producto con este ${field}`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    
    // Reordenar productos en la misma categoría
    await this.reorderAfterDeletion(deletedProduct.categoria, deletedProduct.ordenCategoria);
    
    return { message: `Producto ${deletedProduct.nombre} eliminado correctamente` };
  }

  async reorderProduct(reorderDto: ReorderProductDto): Promise<{ message: string }> {
    const { productId, direction } = reorderDto;
    
    const product = await this.findOne(productId);
    
    // Obtener productos de la misma categoría ordenados
    const categoryProducts = await this.productModel
      .find({ categoria: product.categoria })
      .sort({ ordenCategoria: 1 })
      .exec();
    
    const currentIndex = categoryProducts.findIndex(p => p._id.toString() === productId);
    
    if (currentIndex === -1) {
      throw new NotFoundException('Producto no encontrado en la categoría');
    }
    
    let targetIndex: number;
    
    if (direction === 'up') {
      if (currentIndex === 0) {
        throw new BadRequestException('El producto ya está en la primera posición');
      }
      targetIndex = currentIndex - 1;
    } else {
      if (currentIndex === categoryProducts.length - 1) {
        throw new BadRequestException('El producto ya está en la última posición');
      }
      targetIndex = currentIndex + 1;
    }
    
    // Intercambiar posiciones
    const currentProduct = categoryProducts[currentIndex];
    const targetProduct = categoryProducts[targetIndex];
    
    const tempOrder = currentProduct.ordenCategoria;
    currentProduct.ordenCategoria = targetProduct.ordenCategoria;
    targetProduct.ordenCategoria = tempOrder;
    
    // Guardar cambios
    await Promise.all([
      currentProduct.save(),
      targetProduct.save()
    ]);
    
    const action = direction === 'up' ? 'subió' : 'bajó';
    return {
      message: `"${product.nombre}" ${action} a la posición ${currentProduct.ordenCategoria} en ${product.categoria}`
    };
  }

  /**
   * Obtener el siguiente orden disponible para una categoría
   */
  async getNextOrderForCategory(categoria: string): Promise<number> {
    const maxOrderProduct = await this.productModel
      .findOne({ categoria })
      .sort({ ordenCategoria: -1 })
      .exec();

    return maxOrderProduct ? maxOrderProduct.ordenCategoria + 1 : 1;
  }

  /**
   * Eliminar imagen de producto del servidor
   */
  async deleteProductImage(imagePath: string): Promise<{ success: boolean }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Construir la ruta completa del archivo
      const fullPath = path.join(process.cwd(), imagePath.replace(/^\//, ''));
      
      // Verificar si el archivo existe
      if (fs.existsSync(fullPath)) {
        // Eliminar el archivo
        fs.unlinkSync(fullPath);
        console.log(`✅ Imagen eliminada: ${fullPath}`);
      } else {
        console.log(`⚠️ Archivo no encontrado: ${fullPath}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      return { success: false };
    }
  }

  async updateProductOrder(id: string, newOrder: number): Promise<Product> {
    try {
      console.log(`🔄 Iniciando updateProductOrder: ID=${id}, newOrder=${newOrder}`);
      
      // Validar que newOrder sea un número válido
      if (!newOrder || newOrder < 1) {
        throw new BadRequestException('El orden debe ser un número positivo mayor a 0');
      }

      // Obtener el producto que se va a mover
      const productToMove = await this.productModel.findById(id).exec();
      if (!productToMove) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      const currentOrder = productToMove.ordenCategoria || 1;
      const categoria = productToMove.categoria;
      
      console.log(`📝 Producto a mover: ${productToMove.nombre}, Orden actual: ${currentOrder}, Categoría: ${categoria}`);

      // Si el orden no cambia, no hacer nada
      if (currentOrder === newOrder) {
        console.log('ℹ️ El orden no cambia, retornando producto sin modificar');
        return productToMove;
      }

      // Buscar si existe otro producto con el nuevo orden en la misma categoría
      const conflictingProduct = await this.productModel.findOne({
        categoria: categoria,
        ordenCategoria: newOrder,
        _id: { $ne: id } // Excluir el producto actual
      }).exec();

      // Si hay conflicto, hacer swap (intercambio)
      if (conflictingProduct) {
        console.log(`⚠️ Conflicto detectado: Producto ${conflictingProduct.nombre} ya tiene orden ${newOrder}`);
        console.log(`🔄 Intercambiando órdenes: ${productToMove.nombre} (${currentOrder} → ${newOrder}) con ${conflictingProduct.nombre} (${newOrder} → ${currentOrder})`);
        
        // Hacer intercambio sin transacción (simplificado)
        // Paso 1: Mover el producto conflictivo a un orden temporal
        const tempOrder = -Math.abs(Date.now()); // Orden temporal único
        await this.productModel.findByIdAndUpdate(
          conflictingProduct._id,
          { ordenCategoria: tempOrder }
        ).exec();
        
        // Paso 2: Mover el producto principal al nuevo orden
        await this.productModel.findByIdAndUpdate(
          id,
          { ordenCategoria: newOrder }
        ).exec();
        
        // Paso 3: Mover el producto conflictivo al orden anterior del producto principal
        await this.productModel.findByIdAndUpdate(
          conflictingProduct._id,
          { ordenCategoria: currentOrder }
        ).exec();
        
        console.log(`✅ Intercambio completado exitosamente`);
      } else {
        console.log('ℹ️ No hay conflicto, actualizando directamente');
        // No hay conflicto, actualizar directamente
        await this.productModel.findByIdAndUpdate(
          id,
          { ordenCategoria: newOrder }
        ).exec();
      }

      // Retornar el producto actualizado
      const updatedProduct = await this.productModel.findById(id).exec();
      if (!updatedProduct) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado después de la actualización`);
      }
      
      console.log(`✅ Orden actualizado exitosamente: ${updatedProduct.nombre} ahora tiene orden ${updatedProduct.ordenCategoria}`);
      return updatedProduct;
      
    } catch (error) {
      console.error('❌ Error en updateProductOrder:', error);
      console.error('❌ Stack trace:', error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Error al actualizar el orden del producto: ${error.message}`);
    }
  }

  async getProductsByCategory(): Promise<{ [key: string]: Product[] }> {
    const products = await this.productModel
      .find({ publicado: true })
      .sort({ categoria: 1, ordenCategoria: 1 })
      .exec();
    
    const productsByCategory: { [key: string]: Product[] } = {};
    
    products.forEach(product => {
      if (!productsByCategory[product.categoria]) {
        productsByCategory[product.categoria] = [];
      }
      productsByCategory[product.categoria].push(product);
    });
    
    return productsByCategory;
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    unpublished: number;
    byCategory: { [key: string]: number };
  }> {
    const [total, published, byCategory] = await Promise.all([
      this.productModel.countDocuments().exec(),
      this.productModel.countDocuments({ publicado: true }).exec(),
      this.productModel.aggregate([
        {
          $group: {
            _id: '$categoria',
            count: { $sum: 1 }
          }
        }
      ]).exec()
    ]);
    
    const categoryStats: { [key: string]: number } = {};
    byCategory.forEach(item => {
      categoryStats[item._id] = item.count;
    });
    
    return {
      total,
      published,
      unpublished: total - published,
      byCategory: categoryStats
    };
  }

  private async reorderAfterDeletion(categoria: string, deletedOrder: number): Promise<void> {
    // Decrementar el orden de todos los productos que tenían un orden mayor
    await this.productModel.updateMany(
      { 
        categoria,
        ordenCategoria: { $gt: deletedOrder }
      },
      { 
        $inc: { ordenCategoria: -1 }
      }
    ).exec();
  }

  /**
   * MÉTODO TEMPORAL: Restaurar valores correctos de ordenCategoria
   * Asigna orden secuencial (1, 2, 3...) por categoría basado en fecha de creación
   */
  async restoreOrdenCategoria(): Promise<{message: string, restored: any[]}> {
    try {
      console.log('🔄 Iniciando restauración de ordenCategoria...');
      
      // Obtener todas las categorías únicas
      const categorias = await this.productModel.distinct('categoria').exec();
      console.log('📂 Categorías encontradas:', categorias);
      
      const restored = [];
      
      for (const categoria of categorias) {
        console.log(`\n🔄 Procesando categoría: ${categoria}`);
        
        // Obtener productos de esta categoría ordenados por fecha de creación
        const productos = await this.productModel
          .find({ categoria })
          .sort({ createdAt: 1 }) // Más antiguo primero
          .exec();
        
        console.log(`   📦 Productos encontrados: ${productos.length}`);
        
        // Asignar orden secuencial (1, 2, 3, ...)
        for (let i = 0; i < productos.length; i++) {
          const nuevoOrden = i + 1;
          
          await this.productModel.updateOne(
            { _id: productos[i]._id },
            { $set: { ordenCategoria: nuevoOrden } }
          ).exec();
          
          restored.push({
            id: productos[i]._id,
            nombre: productos[i].nombre,
            categoria: categoria,
            ordenAnterior: productos[i].ordenCategoria,
            ordenNuevo: nuevoOrden
          });
          
          console.log(`   ✅ ${productos[i].nombre} → ordenCategoria: ${nuevoOrden}`);
        }
      }
      
      console.log('\n🎉 ¡Restauración completada!');
      
      return {
        message: `Restauración completada. ${restored.length} productos actualizados en ${categorias.length} categorías.`,
        restored
      };
      
    } catch (error) {
      console.error('❌ Error en restauración:', error);
      throw new BadRequestException('Error al restaurar ordenCategoria: ' + error.message);
    }
  }
}
