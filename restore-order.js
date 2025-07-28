const { MongoClient } = require('mongodb');

async function restoreOrdenCategoria() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');
    
    const db = client.db('logola');
    const collection = db.collection('products');
    
    // Obtener todas las categorías únicas
    const categorias = await collection.distinct('categoria');
    console.log('📂 Categorías encontradas:', categorias);
    
    for (const categoria of categorias) {
      console.log(`\n🔄 Procesando categoría: ${categoria}`);
      
      // Obtener productos de esta categoría ordenados por fecha de creación
      const productos = await collection
        .find({ categoria })
        .sort({ createdAt: 1 }) // Ordenar por fecha de creación (más antiguo primero)
        .toArray();
      
      console.log(`   📦 Productos encontrados: ${productos.length}`);
      
      // Asignar orden secuencial (1, 2, 3, ...)
      for (let i = 0; i < productos.length; i++) {
        const nuevoOrden = i + 1;
        
        await collection.updateOne(
          { _id: productos[i]._id },
          { $set: { ordenCategoria: nuevoOrden } }
        );
        
        console.log(`   ✅ ${productos[i].nombre} → ordenCategoria: ${nuevoOrden}`);
      }
    }
    
    console.log('\n🎉 ¡Restauración completada!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

restoreOrdenCategoria();
