const { MongoClient } = require('mongodb');

async function checkBudgetFields() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  console.log('📋 CAMPOS REALES EN BBDD (primer presupuesto como ejemplo):');
  const budget = await db.collection('budgets').findOne({});
  
  if (budget) {
    console.log('\n🔍 ESTRUCTURA COMPLETA:');
    console.log(JSON.stringify(budget, null, 2));
    
    console.log('\n📊 CAMPOS PRINCIPALES:');
    console.log(`- _id: ${budget._id}`);
    console.log(`- numeroPresupuesto: ${budget.numeroPresupuesto}`);
    console.log(`- numeroPedido: ${budget.numeroPedido}`);
    console.log(`- estado: ${budget.estado}`);
    console.log(`- createdAt: ${budget.createdAt}`);
    console.log(`- updatedAt: ${budget.updatedAt}`);
    console.log(`- precioTotal: ${budget.precioTotal}`);
    
    console.log('\n👤 DATOS DEL CLIENTE:');
    if (budget.cliente) {
      console.log(`- cliente.nombre: ${budget.cliente.nombre}`);
      console.log(`- cliente.empresa: ${budget.cliente.empresa}`);
      console.log(`- cliente.email: ${budget.cliente.email}`);
      console.log(`- cliente.telefono: ${budget.cliente.telefono}`);
      console.log(`- cliente.direccion: ${budget.cliente.direccion}`);
    }
    
    console.log('\n🛍️ PRODUCTOS:');
    if (budget.productos && budget.productos.length > 0) {
      console.log(`- Total productos: ${budget.productos.length}`);
      console.log(`- Cantidad total: ${budget.productos.reduce((total, p) => total + p.cantidad, 0)}`);
    }
  }
  
  await client.close();
}

checkBudgetFields().catch(console.error);
