const { MongoClient } = require('mongodb');

async function checkFields() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  const budget = await db.collection('budgets').findOne({ numeroPresupuesto: 8 });
  
  console.log('📋 Presupuesto #8 - Productos:');
  budget.productos.forEach((producto, i) => {
    console.log(`\nProducto ${i+1}:`);
    console.log('  Campos:', Object.keys(producto));
    console.log('  productId:', producto.productId);
    console.log('  productoId:', producto.productoId);
    console.log('  cantidad:', producto.cantidad);
    console.log('  precioUnitario:', producto.precioUnitario);
  });
  
  await client.close();
}

checkFields().catch(console.error);
