const { MongoClient } = require('mongodb');

async function getProducts() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('logolate');
    const products = await db.collection('products').find({}).toArray();
    
    console.log('📦 Productos disponibles en la base de datos:');
    products.forEach(p => {
      console.log(`- ID: ${p._id}`);
      console.log(`  Nombre: ${p.nombre}`);
      console.log(`  Categoría: ${p.categoria}`);
      console.log(`  Precio: €${p.precio}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

getProducts();
