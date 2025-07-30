// Script para asignar numeroPresupuesto a presupuestos existentes
const { MongoClient } = require('mongodb');

async function updateBudgets() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db('logolate');
    const collection = db.collection('budgets');
    
    // Obtener todos los presupuestos ordenados por fecha de creación
    const budgets = await collection.find({}).sort({ createdAt: 1 }).toArray();
    console.log(`Encontrados ${budgets.length} presupuestos`);
    
    // Asignar numeroPresupuesto secuencialmente
    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      const numeroPresupuesto = i + 1;
      
      await collection.updateOne(
        { _id: budget._id },
        { $set: { numeroPresupuesto: numeroPresupuesto } }
      );
      
      console.log(`Actualizado presupuesto ${budget.numeroPedido} con numeroPresupuesto: ${numeroPresupuesto}`);
    }
    
    console.log('✅ Todos los presupuestos han sido actualizados');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateBudgets();
