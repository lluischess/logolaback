const { MongoClient } = require('mongodb');

async function updateProductNumbers() {
  // Usar la misma URI que el backend NestJS
  const uri = 'mongodb://127.0.0.1:27017/logolaback';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db('logolaback');
    const collection = db.collection('products');

    // Obtener todos los productos ordenados por fecha de creación
    const products = await collection.find({}).sort({ createdAt: 1 }).toArray();
    console.log(`Encontrados ${products.length} productos`);

    if (products.length === 0) {
      console.log('No se encontraron productos. Verificando otras bases de datos...');
      
      // Intentar con diferentes nombres de base de datos
      const databases = ['logola', 'logolaback', 'test'];
      
      for (const dbName of databases) {
        const testDb = client.db(dbName);
        const testCollection = testDb.collection('products');
        const testProducts = await testCollection.find({}).limit(1).toArray();
        
        if (testProducts.length > 0) {
          console.log(`✅ Productos encontrados en la base de datos: ${dbName}`);
          
          // Obtener todos los productos de la base de datos correcta
          const allProducts = await testCollection.find({}).sort({ createdAt: 1 }).toArray();
          console.log(`Encontrados ${allProducts.length} productos en ${dbName}`);
          
          // Asignar números secuenciales
          for (let i = 0; i < allProducts.length; i++) {
            const productId = allProducts[i]._id;
            const numeroProducto = i + 1;
            
            await testCollection.updateOne(
              { _id: productId },
              { $set: { numeroProducto: numeroProducto } }
            );
            
            console.log(`Producto ${allProducts[i].nombre} actualizado con número: ${numeroProducto}`);
          }
          
          console.log('✅ Todos los productos han sido actualizados con números secuenciales');
          return;
        }
      }
      
      console.log('❌ No se encontraron productos en ninguna base de datos');
      return;
    }

    // Asignar números secuenciales si se encontraron productos en la base de datos principal
    for (let i = 0; i < products.length; i++) {
      const productId = products[i]._id;
      const numeroProducto = i + 1;
      
      await collection.updateOne(
        { _id: productId },
        { $set: { numeroProducto: numeroProducto } }
      );
      
      console.log(`Producto ${products[i].nombre} actualizado con número: ${numeroProducto}`);
    }

    console.log('✅ Todos los productos han sido actualizados con números secuenciales');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateProductNumbers();
