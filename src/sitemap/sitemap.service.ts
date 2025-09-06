import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../categories/schemas/category.schema';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class SitemapService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async generateSitemap(): Promise<string> {
    // Usar variable de entorno para la URL base, con fallback
    const baseUrl = process.env.FRONTEND_URL || 'https://new.logolate.com';
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Página principal
    sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Página de productos
    sitemap += `
  <url>
    <loc>${baseUrl}/productos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Página de presupuesto
    sitemap += `
  <url>
    <loc>${baseUrl}/presupuesto</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Categorías dinámicas
    try {
      const categories = await this.categoryModel.find({ publicado: true }).exec();
      
      for (const category of categories) {
        const slug = category.urlSlug || category.nombre.toLowerCase().replace(/\s+/g, '-');
        sitemap += `
  <url>
    <loc>${baseUrl}/productos/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    } catch (error) {
      console.error('Error loading categories for sitemap:', error);
    }

    // Productos dinámicos (solo los publicados)
    try {
      const products = await this.productModel
        .find({ publicado: true })
        .select('urlSlug _id updatedAt')
        .limit(1000) // Limitar para evitar sitemaps muy grandes
        .exec();
      
      for (const product of products) {
        const slug = product.urlSlug || product._id;
        const lastmod = product.updatedAt 
          ? product.updatedAt.toISOString().split('T')[0] 
          : currentDate;
          
        sitemap += `
  <url>
    <loc>${baseUrl}/producto/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    } catch (error) {
      console.error('Error loading products for sitemap:', error);
    }

    sitemap += `
</urlset>`;

    return sitemap;
  }
}
