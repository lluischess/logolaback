const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');

async function debugProductFinding() {
  console.log('🔍 DEBUGGING: ¿Por qué no se encuentran los productos?');
  
  // Conectar a MongoDB directamente
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  // Conectar con Mongoose
  await mongoose.connect('mongodb://localhost:27017/logolate');
  
  // Obtener el presupuesto #8
  const budget = await db.collection('budgets').findOne({ numeroPresupuesto: 8 });
  console.log('📋 Presupuesto #8 encontrado:', !!budget);
  
  if (budget) {
    console.log('📦 Productos en presupuesto:');
    budget.productos.forEach((prod, i) => {
      console.log(`  ${i+1}. productId: "${prod.productId}" (tipo: ${typeof prod.productId})`);
    });
    
    // Probar diferentes métodos de búsqueda para cada producto
    for (const budgetProduct of budget.productos) {
      const productId = budgetProduct.productId;
      console.log(`\n🔍 Probando búsqueda para ID: "${productId}"`);
      
      // Método 1: MongoDB directo con string
      try {
        const product1 = await db.collection('products').findOne({ _id: new ObjectId(productId) });
        console.log(`  ✅ MongoDB directo: ${product1 ? 'ENCONTRADO - ' + product1.nombre : 'NO ENCONTRADO'}`);
      } catch (error) {
        console.log(`  ❌ MongoDB directo: ERROR - ${error.message}`);
      }
      
      // Método 2: Mongoose findById
      try {
        const Product = mongoose.model('Product', new mongoose.Schema({}, { collection: 'products' }));
        const product2 = await Product.findById(productId).exec();
        console.log(`  ✅ Mongoose findById: ${product2 ? 'ENCONTRADO - ' + product2.nombre : 'NO ENCONTRADO'}`);
      } catch (error) {
        console.log(`  ❌ Mongoose findById: ERROR - ${error.message}`);
      }
      
      // Método 3: Mongoose findOne con ObjectId
      try {
        const Product = mongoose.model('Product', new mongoose.Schema({}, { collection: 'products' }));
        const product3 = await Product.findOne({ _id: new ObjectId(productId) }).exec();
        console.log(`  ✅ Mongoose findOne: ${product3 ? 'ENCONTRADO - ' + product3.nombre : 'NO ENCONTRADO'}`);
      } catch (error) {
        console.log(`  ❌ Mongoose findOne: ERROR - ${error.message}`);
      }
      
      // Método 4: Verificar si el ID es válido
      console.log(`  🔍 ObjectId.isValid("${productId}"): ${ObjectId.isValid(productId)}`);
      
      // Método 5: Listar todos los productos para comparar
      const allProducts = await db.collection('products').find({}).toArray();
      const foundProduct = allProducts.find(p => p._id.toString() === productId);
      console.log(`  🔍 Búsqueda manual: ${foundProduct ? 'ENCONTRADO - ' + foundProduct.nombre : 'NO ENCONTRADO'}`);
    }
  }
  
  await client.close();
  await mongoose.disconnect();
}

debugProductFinding().catch(console.error);
