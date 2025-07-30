const { MongoClient } = require('mongodb');

async function updateProductImages() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const productsCollection = db.collection('products');

    // Obtener todos los productos
    const products = await productsCollection.find({}).toArray();
    console.log(`📦 Encontrados ${products.length} productos para actualizar`);

    // Mapeo de imágenes por tipo de producto
    const imageMap = {
      'chocolates': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop',
      'caramelos': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=400&fit=crop',
      'galletas': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      'hoteles': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop',
      'gominolas': 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400&h=400&fit=crop',
      'turrones': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop'
    };

    // Actualizar cada producto con su imagen correspondiente
    for (const product of products) {
      const categoria = product.categoria?.toLowerCase() || 'chocolates';
      const imagen = imageMap[categoria] || imageMap['chocolates']; // Fallback a chocolates

      const result = await productsCollection.updateOne(
        { _id: product._id },
        { 
          $set: { 
            imagen: imagen,
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✅ ${product.nombre} - Categoría: ${product.categoria} - Imagen actualizada`);
    }

    console.log('\n🎉 Todas las imágenes de productos han sido actualizadas exitosamente!');
    console.log('\n📋 Mapeo de imágenes por categoría:');
    Object.entries(imageMap).forEach(([categoria, url]) => {
      console.log(`   ${categoria}: ${url.substring(0, 50)}...`);
    });

    console.log('\n🔄 Ahora los presupuestos mostrarán las imágenes correctas de los productos');

  } catch (error) {
    console.error('❌ Error actualizando imágenes de productos:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

updateProductImages();
