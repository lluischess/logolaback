import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto, ReorderCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await this.categoryModel.findOne({ nombre: createCategoryDto.nombre });
      if (existingCategory) {
        throw new BadRequestException(`Ya existe una categoría con el nombre: ${createCategoryDto.nombre}`);
      }

      // Si no se especifica orden, asignar el siguiente disponible
      if (!createCategoryDto.orden) {
        const maxOrder = await this.categoryModel.findOne().sort({ orden: -1 }).select('orden');
        createCategoryDto.orden = maxOrder ? maxOrder.orden + 1 : 1;
      } else {
        // Verificar si el orden ya existe
        const existingOrder = await this.categoryModel.findOne({ orden: createCategoryDto.orden });
        if (existingOrder) {
          throw new BadRequestException(`Ya existe una categoría con el orden: ${createCategoryDto.orden}`);
        }
      }

      const createdCategory = new this.categoryModel(createCategoryDto);
      return await createdCategory.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`Ya existe una categoría con este ${field}`);
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryCategoryDto = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'orden',
      sortOrder = 'asc',
      search,
      publicado,
      configuracionEspecial
    } = queryDto;

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Construir filtros
    const filters: any = {};
    
    if (search) {
      filters.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } },
        { palabrasClave: { $regex: search, $options: 'i' } }
      ];
    }

    if (publicado !== undefined) {
      filters.publicado = publicado;
    }

    if (configuracionEspecial !== undefined) {
      filters.configuracionEspecial = configuracionEspecial;
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filters)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filters)
    ]);

    // Obtener conteo de productos para cada categoría
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({ 
          categoria: category.nombre.toLowerCase() 
        });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    return {
      categories: categoriesWithProductCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ urlSlug: slug }).exec();
    if (!category) {
      throw new NotFoundException(`Categoría con slug ${slug} no encontrada`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      // Si se actualiza el nombre, verificar que no exista otra categoría con ese nombre
      if (updateCategoryDto.nombre) {
        const existingCategory = await this.categoryModel.findOne({ 
          nombre: updateCategoryDto.nombre,
          _id: { $ne: id }
        });
        if (existingCategory) {
          throw new BadRequestException(`Ya existe una categoría con el nombre: ${updateCategoryDto.nombre}`);
        }
      }

      // Si se actualiza el orden, verificar que no exista otra categoría con ese orden
      if (updateCategoryDto.orden) {
        const existingOrder = await this.categoryModel.findOne({ 
          orden: updateCategoryDto.orden,
          _id: { $ne: id }
        });
        if (existingOrder) {
          throw new BadRequestException(`Ya existe una categoría con el orden: ${updateCategoryDto.orden}`);
        }
      }

      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, { new: true })
        .exec();
      
      if (!updatedCategory) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      
      return updatedCategory;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`Ya existe una categoría con este ${field}`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return { message: `Categoría ${deletedCategory.nombre} eliminada correctamente` };
  }

  async reorder(reorderDto: ReorderCategoryDto): Promise<{ message: string }> {
    const { categoryId, direction } = reorderDto;

    const category = await this.categoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const currentOrder = category.orden;
    let targetOrder: number;

    if (direction === 'up') {
      targetOrder = currentOrder - 1;
      if (targetOrder < 1) {
        throw new BadRequestException('La categoría ya está en la primera posición');
      }
    } else {
      targetOrder = currentOrder + 1;
      const maxOrder = await this.categoryModel.findOne().sort({ orden: -1 }).select('orden');
      if (targetOrder > maxOrder.orden) {
        throw new BadRequestException('La categoría ya está en la última posición');
      }
    }

    // Buscar la categoría que tiene el orden objetivo
    const targetCategory = await this.categoryModel.findOne({ orden: targetOrder });
    if (!targetCategory) {
      throw new BadRequestException('No se puede reordenar: posición objetivo no válida');
    }

    // Intercambiar órdenes
    await Promise.all([
      this.categoryModel.findByIdAndUpdate(categoryId, { orden: targetOrder }),
      this.categoryModel.findByIdAndUpdate(targetCategory._id, { orden: currentOrder })
    ]);

    return { 
      message: `Categoría ${category.nombre} movida ${direction === 'up' ? 'hacia arriba' : 'hacia abajo'} correctamente` 
    };
  }

  async getStats() {
    const [total, published, unpublished, special] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ publicado: true }),
      this.categoryModel.countDocuments({ publicado: false }),
      this.categoryModel.countDocuments({ configuracionEspecial: true })
    ]);

    return {
      total,
      published,
      unpublished,
      special
    };
  }

  async getPublishedCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ publicado: true })
      .sort({ orden: 1 })
      .exec();
  }

  async getNovedadesCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ publicado: true, configuracionEspecial: true })
      .sort({ orden: 1 })
      .exec();
  }
}
