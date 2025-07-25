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

  async findByCategory(categoria: string): Promise<Product[]> {
    return await this.productModel
      .find({ categoria, publicado: true })
      .sort({ ordenCategoria: 1 })
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
}
