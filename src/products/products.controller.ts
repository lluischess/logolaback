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
  HttpCode
} from '@nestjs/common';
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
  async updateProductOrder(@Param('id') id: string, @Body() body: { orden: number }) {
    return await this.productsService.updateProductOrder(id, body.orden);
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
