const { MongoClient, ObjectId } = require('mongodb');

async function checkBudgetImages() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const budgetsCollection = db.collection('budgets');
    const productsCollection = db.collection('products');

    // 1. Obtener presupuesto 7
    console.log('📋 Buscando presupuesto número 7...');
    const budget = await budgetsCollection.findOne({ numeroPresupuesto: 7 });
    
    if (!budget) {
      console.log('❌ Presupuesto 7 no encontrado');
      return;
    }

    console.log(`✅ Presupuesto encontrado: ${budget.cliente?.empresa}`);
    console.log(`📦 Productos en presupuesto: ${budget.productos?.length || 0}`);
    console.log('');

    // 2. Verificar cada producto del presupuesto
    for (let i = 0; i < budget.productos.length; i++) {
      const prodPresupuesto = budget.productos[i];
      console.log(`🔍 PRODUCTO ${i + 1}:`);
      console.log(`   Producto ID: ${prodPresupuesto.productoId}`);
      console.log(`   Cantidad: ${prodPresupuesto.cantidad}`);
      console.log(`   Precio: ${prodPresupuesto.precioUnitario}€`);

      // Buscar el producto real en la colección de productos
      const productReal = await productsCollection.findOne({ 
        _id: new ObjectId(prodPresupuesto.productoId) 
      });

      if (productReal) {
        console.log(`   ✅ Producto real encontrado:`);
        console.log(`      - Nombre: ${productReal.nombre}`);
        console.log(`      - Imagen: ${productReal.imagen || 'SIN IMAGEN'}`);
        console.log(`      - Categoría: ${productReal.categoria || 'SIN CATEGORÍA'}`);
        console.log(`      - Precio actual: ${productReal.precio}€`);
        console.log(`      - Publicado: ${productReal.publicado ? 'SÍ' : 'NO'}`);
        
        // Verificar si la imagen existe
        if (productReal.imagen) {
          console.log(`      - URL imagen: ${productReal.imagen}`);
          if (productReal.imagen.startsWith('http')) {
            console.log(`      - Tipo: URL externa`);
          } else {
            console.log(`      - Tipo: Ruta local`);
          }
        } else {
          console.log(`      - ⚠️  PROBLEMA: Producto sin imagen`);
        }
      } else {
        console.log(`   ❌ Producto real NO encontrado en catálogo`);
      }
      console.log('');
    }

    // 3. Probar endpoint enriquecido
    console.log('🌐 Probando endpoint enriquecido...');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3000/budgets/numero/7/enriched', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imx1aXNhZG1pbiIsImlhdCI6MTczMjk1NjkxMCwiZXhwIjoxNzMyOTYwNTEwfQ.Qs3vhQGOKJdcXKNHqOCdXGJ8Fk_wjOqUYkBqpKJdXGI'
        }
      });

      if (response.ok) {
        const enrichedData = await response.json();
        console.log('✅ Endpoint enriquecido funciona');
        console.log('📦 Productos enriquecidos:');
        
        enrichedData.productos?.forEach((prod, index) => {
          console.log(`   ${index + 1}. ${prod.producto?.nombre || 'Sin nombre'}`);
          console.log(`      - Imagen: ${prod.producto?.imagen || 'SIN IMAGEN'}`);
          console.log(`      - Categoría: ${prod.producto?.categoria?.nombre || 'Sin categoría'}`);
        });
      } else {
        console.log(`❌ Error en endpoint: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      console.log(`❌ Error conectando al endpoint: ${fetchError.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

checkBudgetImages();
