const { MongoClient, ObjectId } = require('mongodb');

async function fixPresupuestoPrices() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('logolate');
  
  console.log('🔧 CORRIGIENDO PRECIOS DE PRESUPUESTOS...');
  
  // Obtener precios reales de productos
  const products = await db.collection('products').find({}).toArray();
  const productPrices = {};
  
  products.forEach(product => {
    productPrices[product._id.toString()] = product.precio;
    console.log(`📦 ${product.nombre}: €${product.precio} (ID: ${product._id})`);
  });
  
  console.log('\n🔄 ACTUALIZANDO PRESUPUESTOS #8 y #9...');
  
  // Corregir presupuesto #8
  const budget8 = await db.collection('budgets').findOne({ numeroPresupuesto: 8 });
  if (budget8) {
    console.log('\n📋 Presupuesto #8 - ANTES:');
    budget8.productos.forEach(prod => {
      console.log(`  - ProductID: ${prod.productId}, Precio: €${prod.precioUnitario}`);
    });
    
    // Actualizar precios con los reales
    const updatedProducts8 = budget8.productos.map(prod => {
      const realPrice = productPrices[prod.productId];
      if (realPrice) {
        console.log(`  ✅ Actualizando ${prod.productId}: €${prod.precioUnitario} → €${realPrice}`);
        return {
          ...prod,
          precioUnitario: realPrice,
          subtotal: prod.cantidad * realPrice
        };
      }
      return prod;
    });
    
    // Calcular nuevo precio total
    const newTotal8 = updatedProducts8.reduce((sum, prod) => sum + prod.subtotal, 0);
    
    await db.collection('budgets').updateOne(
      { numeroPresupuesto: 8 },
      { 
        $set: { 
          productos: updatedProducts8,
          precioTotal: newTotal8
        }
      }
    );
    
    console.log(`  ✅ Presupuesto #8 actualizado. Nuevo total: €${newTotal8}`);
  }
  
  // Corregir presupuesto #9 (si tiene productIds válidos)
  const budget9 = await db.collection('budgets').findOne({ numeroPresupuesto: 9 });
  if (budget9) {
    console.log('\n📋 Presupuesto #9 - ANTES:');
    budget9.productos.forEach(prod => {
      console.log(`  - ProductID: ${prod.productId}, Precio: €${prod.precioUnitario}`);
    });
    
    // El presupuesto #9 tiene productIds incorrectos ('1', '2', '3')
    // Necesitamos mapearlos a los IDs reales
    const productMapping = {
      '1': '6883f4b0e0776e2037449ec8', // BOMBÓN NAVIDAD
      '2': '6883f4e3e0776e2037449ece', // Bombón Chocolate Premium  
      '3': '6883f5fa9271b9431b9addc3'  // Caramelos Artesanales Miel
    };
    
    const updatedProducts9 = budget9.productos.map(prod => {
      const realProductId = productMapping[prod.productId];
      const realPrice = productPrices[realProductId];
      
      if (realProductId && realPrice) {
        console.log(`  ✅ Actualizando ${prod.productId} → ${realProductId}: €${prod.precioUnitario} → €${realPrice}`);
        return {
          ...prod,
          productId: realProductId,
          precioUnitario: realPrice,
          subtotal: prod.cantidad * realPrice
        };
      }
      return prod;
    });
    
    // Calcular nuevo precio total
    const newTotal9 = updatedProducts9.reduce((sum, prod) => sum + prod.subtotal, 0);
    
    await db.collection('budgets').updateOne(
      { numeroPresupuesto: 9 },
      { 
        $set: { 
          productos: updatedProducts9,
          precioTotal: newTotal9
        }
      }
    );
    
    console.log(`  ✅ Presupuesto #9 actualizado. Nuevo total: €${newTotal9}`);
  }
  
  console.log('\n🎉 CORRECCIÓN COMPLETADA!');
  console.log('Los presupuestos #8 y #9 ahora usan los precios reales de los productos.');
  
  await client.close();
}

fixPresupuestoPrices().catch(console.error);
