const { MongoClient } = require('mongodb');

async function checkBudgetStates() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  console.log('📋 ESTADOS REALES EN BBDD:');
  const budgets = await db.collection('budgets').find({}).toArray();
  
  budgets.forEach(budget => {
    console.log(`Presupuesto #${budget.numeroPresupuesto}: estado='${budget.estado}'`);
  });
  
  console.log('\n📊 RESUMEN DE ESTADOS:');
  const estadoCounts = {};
  budgets.forEach(budget => {
    const estado = budget.estado || 'undefined';
    estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
  });
  
  Object.entries(estadoCounts).forEach(([estado, count]) => {
    console.log(`- ${estado}: ${count} presupuestos`);
  });
  
  await client.close();
}

checkBudgetStates().catch(console.error);
