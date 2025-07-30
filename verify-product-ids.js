const { MongoClient, ObjectId } = require('mongodb');

async function verifyProductIds() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('logolate');
    
    const productIds = [
      '6883f5fa9271b9431b9addc3', // Caramelos Artesanales Miel
      '6883f61d9271b9431b9addc7', // Galletas Chocolate Chip  
      '688779f61934cffb85d545a9'  // Miel
    ];
    
    console.log('🔍 Verificando IDs de productos en la base de datos:');
    
    for (const id of productIds) {
      try {
        const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
        if (product) {
          console.log(`✅ ID: ${id} -> ENCONTRADO: ${product.nombre}`);
        } else {
          console.log(`❌ ID: ${id} -> NO ENCONTRADO`);
        }
      } catch (error) {
        console.log(`❌ ID: ${id} -> ERROR: ${error.message}`);
      }
    }
    
    // También verificar qué productos existen realmente
    console.log('\n📦 Productos que SÍ existen en la base de datos:');
    const allProducts = await db.collection('products').find({}).toArray();
    allProducts.forEach(p => {
      console.log(`- ID: ${p._id} | Nombre: ${p.nombre}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

verifyProductIds();
