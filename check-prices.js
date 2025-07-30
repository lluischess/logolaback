const { MongoClient } = require('mongodb');

async function checkPrices() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  console.log('💰 PRECIOS REALES EN BBDD:');
  const products = await db.collection('products').find({}).toArray();
  
  products.forEach(product => {
    console.log(`- ${product.nombre}`);
    console.log(`  ID: ${product._id}`);
    console.log(`  Precio: €${product.precio || 'Sin precio'}`);
    console.log(`  Categoría: ${product.categoria}`);
    console.log('');
  });
  
  console.log('📋 PRECIOS EN PRESUPUESTOS:');
  const budgets = await db.collection('budgets').find({}).toArray();
  
  budgets.forEach(budget => {
    console.log(`\nPresupuesto #${budget.numeroPresupuesto}:`);
    budget.productos.forEach(prod => {
      console.log(`  - ProductID: ${prod.productId}`);
      console.log(`    Precio unitario: €${prod.precioUnitario}`);
      console.log(`    Cantidad: ${prod.cantidad}`);
    });
  });
  
  await client.close();
}

checkPrices().catch(console.error);
