const { MongoClient } = require('mongodb');

async function createBudgetWithReferences() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const productsCollection = db.collection('products');
    const budgetsCollection = db.collection('budgets');

    // 1. Obtener productos reales para hacer referencias
    console.log('📦 Obteniendo productos reales para referencias...');
    const realProducts = await productsCollection.find({ publicado: true }).toArray();
    
    if (realProducts.length === 0) {
      console.log('❌ No hay productos reales en la base de datos');
      return;
    }

    console.log(`✅ Productos disponibles para referenciar:`);
    realProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre} - ${product.precio}€ (ID: ${product._id})`);
    });

    // 2. Seleccionar productos para el presupuesto (solo referencias)
    const selectedProducts = realProducts.slice(0, 3);

    // 3. Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;

    // 4. Crear presupuesto con NUEVA ESTRUCTURA (solo referencias + precios específicos)
    const budgetProducts = selectedProducts.map(product => ({
      // NUEVA ESTRUCTURA: Solo referencia + datos específicos del presupuesto
      productoId: product._id.toString(),  // Referencia al producto
      cantidad: Math.floor(Math.random() * 100) + 50,  // Cantidad específica del presupuesto
      precioUnitario: product.precio * (0.8 + Math.random() * 0.4)  // Precio específico (puede ser diferente al producto)
      // NO almacenar: nombre, imagen, categoria (se obtienen por JOIN)
    }));

    const newBudget = {
      numeroPedido: `P-${nextNumero}`,
      numeroPresupuesto: nextNumero,
      
      // Datos del cliente
      cliente: {
        email: 'test@nuevaestructura.com',
        nombre: 'Cliente Estructura Nueva',
        telefono: '+34 600 123 456',
        direccion: 'Calle Nueva Estructura 1, Madrid',
        empresa: 'Nueva Estructura S.L.',
        detalles: 'Presupuesto de prueba con nueva estructura de referencias a productos'
      },

      // NUEVA ESTRUCTURA: Solo referencias + datos específicos
      productos: budgetProducts,

      estado: 'pendiente',
      logoEmpresa: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      aceptaCorreosPublicitarios: true,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 5. Insertar el presupuesto
    const result = await budgetsCollection.insertOne(newBudget);
    
    console.log('\n✅ Presupuesto con NUEVA ESTRUCTURA creado exitosamente:');
    console.log(`📋 Número de Presupuesto: ${nextNumero}`);
    console.log(`🏢 Empresa: ${newBudget.cliente.empresa}`);
    console.log(`📦 Productos (SOLO REFERENCIAS):`);
    
    let cantidadTotal = 0;
    let precioTotal = 0;
    
    budgetProducts.forEach((prod, index) => {
      const lineTotal = prod.cantidad * prod.precioUnitario;
      cantidadTotal += prod.cantidad;
      precioTotal += lineTotal;
      console.log(`   ${index + 1}. Producto ID: ${prod.productoId}`);
      console.log(`      Cantidad: ${prod.cantidad} uds.`);
      console.log(`      Precio Unitario: ${prod.precioUnitario.toFixed(2)}€`);
      console.log(`      Total Línea: ${lineTotal.toFixed(2)}€`);
      console.log(`      (Nombre e imagen se obtienen por JOIN)`);
      console.log('');
    });
    
    console.log(`📊 Cantidad Total: ${cantidadTotal} uds.`);
    console.log(`💰 Precio Total: ${precioTotal.toFixed(2)} €`);
    console.log(`🆔 MongoDB ID: ${result.insertedId}`);
    console.log(`\n🔗 ENDPOINTS PARA PROBAR:`);
    console.log(`   Normal: GET /budgets/${result.insertedId}`);
    console.log(`   Enriquecido: GET /budgets/${result.insertedId}/enriched`);
    console.log(`   Por número: GET /budgets/numero/${nextNumero}/enriched`);
    console.log(`\n🌐 Frontend: http://localhost:4200/logoadmin/presupuestos/${nextNumero}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

createBudgetWithReferences();
