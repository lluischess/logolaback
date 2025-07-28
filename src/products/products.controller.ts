import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto, ReorderProductDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryProductDto) {
    return await this.productsService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async getStats() {
    return await this.productsService.getStats();
  }

  @Get('by-category')
  async getProductsByCategory() {
    return await this.productsService.getProductsByCategory();
  }

  @Get('category/:categoria')
  async findByCategory(@Param('categoria') categoria: string) {
    return await this.productsService.findByCategory(categoria);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.productsService.findBySlug(slug);
  }

  @Get('next-order/:categoria')
  async getNextOrderForCategory(@Param('categoria') categoria: string) {
    const nextOrder = await this.productsService.getNextOrderForCategory(categoria);
    return { nextOrder };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch('reorder')
  @UseGuards(AuthGuard)
  async reorderProduct(@Body() reorderDto: ReorderProductDto) {
    return await this.productsService.reorderProduct(reorderDto);
  }

  @Patch(':id/order')
  @UseGuards(AuthGuard)
  async updateProductOrder(@Param('id') id: string, @Body() updateOrderDto: { orden: number }) {
    return await this.productsService.updateProductOrder(id, updateOrderDto.orden);
  }

  /**
   * Subir imagen de producto
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/productos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `producto-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadProductImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Devolver la ruta relativa de la imagen
    const imagePath = `/uploads/productos/${file.filename}`;
    return { imagePath };
  }

  /**
   * Eliminar imagen de producto
   */
  @Delete('delete-image')
  async deleteProductImage(@Body() deleteImageDto: { imagePath: string }) {
    return this.productsService.deleteProductImage(deleteImageDto.imagePath);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
