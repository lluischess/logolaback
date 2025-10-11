import { connect, connection } from 'mongoose';

/**
 * Script de migración para actualizar URLs de new.logolate.com a www.logolate.com
 * 
 * Uso:
 * npx ts-node scripts/migrate-urls.ts
 */

const OLD_DOMAIN = 'https://new.logolate.com';
const NEW_DOMAIN = 'https://www.logolate.com';

// URI de MongoDB desde variables de entorno o hardcodeada temporalmente
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://logolate_db_user:RFGhUtsAaEFdlCHc@logolate.rodxdoe.mongodb.net/logolate?retryWrites=true&w=majority';

async function migrateUrls() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = connection.db;

    // ===== 1. MIGRAR CONFIGURACIONES =====
    console.log('📝 Migrando colección: configurations');
    
    // Actualizar imagenPorDefecto en SEO
    const seoResult = await db.collection('configurations').updateMany(
      { 
        tipo: 'seo',
        'datos.imagenPorDefecto': { $regex: OLD_DOMAIN }
      },
      {
        $set: {
          'datos.imagenPorDefecto': { 
            $concat: [
              NEW_DOMAIN,
              { $substr: ['$datos.imagenPorDefecto', OLD_DOMAIN.length, -1] }
            ]
          }
        }
      }
    );
    
    // Usar operación de reemplazo para campos de texto
    const configurations = await db.collection('configurations').find({
      $or: [
        { 'datos.imagenPorDefecto': { $regex: OLD_DOMAIN } },
        { 'datos.logoHeader': { $regex: OLD_DOMAIN } },
        { 'datos.logoFooter': { $regex: OLD_DOMAIN } },
        { 'datos.favicon': { $regex: OLD_DOMAIN } },
        { 'datos.imagenDesktop': { $regex: OLD_DOMAIN } },
        { 'datos.imagenMobile': { $regex: OLD_DOMAIN } },
        { 'datos.ruta': { $regex: OLD_DOMAIN } }
      ]
    }).toArray();

    let configUpdates = 0;
    for (const config of configurations) {
      const updates: any = {};
      
      if (config.datos.imagenPorDefecto?.includes(OLD_DOMAIN)) {
        updates['datos.imagenPorDefecto'] = config.datos.imagenPorDefecto.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.logoHeader?.includes(OLD_DOMAIN)) {
        updates['datos.logoHeader'] = config.datos.logoHeader.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.logoFooter?.includes(OLD_DOMAIN)) {
        updates['datos.logoFooter'] = config.datos.logoFooter.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.favicon?.includes(OLD_DOMAIN)) {
        updates['datos.favicon'] = config.datos.favicon.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.imagenDesktop?.includes(OLD_DOMAIN)) {
        updates['datos.imagenDesktop'] = config.datos.imagenDesktop.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.imagenMobile?.includes(OLD_DOMAIN)) {
        updates['datos.imagenMobile'] = config.datos.imagenMobile.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      if (config.datos.ruta?.includes(OLD_DOMAIN)) {
        updates['datos.ruta'] = config.datos.ruta.replace(OLD_DOMAIN, NEW_DOMAIN);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('configurations').updateOne(
          { _id: config._id },
          { $set: updates }
        );
        configUpdates++;
      }
    }
    
    console.log(`   ✅ Configuraciones actualizadas: ${configUpdates}`);

    // ===== 2. MIGRAR PRODUCTOS =====
    console.log('\n📦 Migrando colección: products');
    
    const products = await db.collection('products').find({
      $or: [
        { imagenes: { $regex: OLD_DOMAIN } },
        { ogImagen: { $regex: OLD_DOMAIN } }
      ]
    }).toArray();

    let productUpdates = 0;
    for (const product of products) {
      const updates: any = {};
      
      // Actualizar array de imágenes
      if (product.imagenes && Array.isArray(product.imagenes)) {
        const newImages = product.imagenes.map((img: string) => 
          img.includes(OLD_DOMAIN) ? img.replace(OLD_DOMAIN, NEW_DOMAIN) : img
        );
        if (JSON.stringify(newImages) !== JSON.stringify(product.imagenes)) {
          updates.imagenes = newImages;
        }
      }
      
      // Actualizar ogImagen
      if (product.ogImagen?.includes(OLD_DOMAIN)) {
        updates.ogImagen = product.ogImagen.replace(OLD_DOMAIN, NEW_DOMAIN);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: updates }
        );
        productUpdates++;
      }
    }
    
    console.log(`   ✅ Productos actualizados: ${productUpdates}`);

    // ===== 3. MIGRAR CATEGORÍAS =====
    console.log('\n📂 Migrando colección: categories');
    
    const categories = await db.collection('categories').find({
      $or: [
        { imagen: { $regex: OLD_DOMAIN } },
        { 'configuracionEspecial.imagenDestacada': { $regex: OLD_DOMAIN } }
      ]
    }).toArray();

    let categoryUpdates = 0;
    for (const category of categories) {
      const updates: any = {};
      
      if (category.imagen?.includes(OLD_DOMAIN)) {
        updates.imagen = category.imagen.replace(OLD_DOMAIN, NEW_DOMAIN);
      }
      
      if (category.configuracionEspecial?.imagenDestacada?.includes(OLD_DOMAIN)) {
        updates['configuracionEspecial.imagenDestacada'] = 
          category.configuracionEspecial.imagenDestacada.replace(OLD_DOMAIN, NEW_DOMAIN);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('categories').updateOne(
          { _id: category._id },
          { $set: updates }
        );
        categoryUpdates++;
      }
    }
    
    console.log(`   ✅ Categorías actualizadas: ${categoryUpdates}`);

    // ===== 4. MIGRAR PRESUPUESTOS (si tienen imágenes) =====
    console.log('\n💰 Migrando colección: budgets');
    
    const budgets = await db.collection('budgets').find({
      'productos.imagenes': { $regex: OLD_DOMAIN }
    }).toArray();

    let budgetUpdates = 0;
    for (const budget of budgets) {
      if (budget.productos && Array.isArray(budget.productos)) {
        const newProductos = budget.productos.map((prod: any) => {
          if (prod.imagenes && Array.isArray(prod.imagenes)) {
            return {
              ...prod,
              imagenes: prod.imagenes.map((img: string) =>
                img.includes(OLD_DOMAIN) ? img.replace(OLD_DOMAIN, NEW_DOMAIN) : img
              )
            };
          }
          return prod;
        });

        await db.collection('budgets').updateOne(
          { _id: budget._id },
          { $set: { productos: newProductos } }
        );
        budgetUpdates++;
      }
    }
    
    console.log(`   ✅ Presupuestos actualizados: ${budgetUpdates}`);

    // ===== RESUMEN FINAL =====
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRACIÓN COMPLETADA CON ÉXITO');
    console.log('='.repeat(50));
    console.log(`📊 Total de documentos actualizados:`);
    console.log(`   • Configuraciones: ${configUpdates}`);
    console.log(`   • Productos: ${productUpdates}`);
    console.log(`   • Categorías: ${categoryUpdates}`);
    console.log(`   • Presupuestos: ${budgetUpdates}`);
    console.log(`   • TOTAL: ${configUpdates + productUpdates + categoryUpdates + budgetUpdates}`);
    console.log('='.repeat(50));
    console.log(`\n🔄 Todas las URLs han sido migradas de:`);
    console.log(`   ${OLD_DOMAIN}`);
    console.log(`   👇`);
    console.log(`   ${NEW_DOMAIN}`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
console.log('\n' + '='.repeat(50));
console.log('🚀 INICIANDO MIGRACIÓN DE URLs');
console.log('='.repeat(50));
console.log(`📍 De: ${OLD_DOMAIN}`);
console.log(`📍 A:  ${NEW_DOMAIN}`);
console.log('='.repeat(50) + '\n');

migrateUrls();
