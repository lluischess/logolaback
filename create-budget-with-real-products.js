const { MongoClient } = require('mongodb');

async function createBudgetWithRealProducts() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const productsCollection = db.collection('products');
    const budgetsCollection = db.collection('budgets');

    // 1. Obtener productos reales de la base de datos
    console.log('📦 Obteniendo productos reales de la base de datos...');
    const realProducts = await productsCollection.find({ publicado: true }).toArray();
    
    if (realProducts.length === 0) {
      console.log('❌ No hay productos reales en la base de datos');
      return;
    }

    console.log(`✅ Encontrados ${realProducts.length} productos reales:`);
    realProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre} - ${product.precio}€ (${product.categoria})`);
    });

    // 2. Seleccionar algunos productos para el presupuesto
    const selectedProducts = realProducts.slice(0, Math.min(4, realProducts.length));

    // 3. Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;

    // 4. Crear presupuesto con productos reales
    const budgetProducts = selectedProducts.map(product => ({
      // Información del producto real
      productoId: product._id, // Referencia al producto original
      nombre: product.nombre,
      categoria: product.categoria,
      cantidad: Math.floor(Math.random() * 200) + 50, // Cantidad aleatoria entre 50-250
      precioUnitario: product.precio, // Precio histórico del momento
      imagen: product.imagen || '/assets/images/producto-placeholder.jpg'
    }));

    const completeBudget = {
      numeroPedido: `P-${nextNumero}`,
      numeroPresupuesto: nextNumero,
      
      // Datos completos del cliente
      cliente: {
        email: 'carlos.martinez@confiteriaelite.es',
        nombre: 'Carlos Martínez Ruiz',
        telefono: '+34 678 543 210',
        direccion: 'Avenida de la Constitución 45, 3º A, 41001 Sevilla, España',
        empresa: 'Confitería Elite Sevilla S.L.',
        detalles: 'Cliente corporativo con pedidos mensuales. Especializado en eventos y celebraciones. Requiere facturación con datos fiscales completos. Entrega preferente los viernes.'
      },

      // Productos reales del catálogo
      productos: budgetProducts,

      // Estado y configuraciones
      estado: 'pendiente',
      logoEmpresa: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      aceptaCorreosPublicitarios: true,
      
      // Fechas
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 5. Insertar el presupuesto
    const result = await budgetsCollection.insertOne(completeBudget);
    
    console.log('\n✅ Presupuesto con productos reales creado exitosamente:');
    console.log(`📋 Número de Presupuesto: ${nextNumero}`);
    console.log(`🏢 Empresa: ${completeBudget.cliente.empresa}`);
    console.log(`👤 Contacto: ${completeBudget.cliente.nombre}`);
    console.log(`📧 Email: ${completeBudget.cliente.email}`);
    console.log(`📦 Productos reales incluidos:`);
    
    let cantidadTotal = 0;
    let precioTotal = 0;
    
    budgetProducts.forEach((prod, index) => {
      const lineTotal = prod.cantidad * prod.precioUnitario;
      cantidadTotal += prod.cantidad;
      precioTotal += lineTotal;
      console.log(`   ${index + 1}. ${prod.nombre} - ${prod.cantidad} uds. × ${prod.precioUnitario}€ = ${lineTotal.toFixed(2)}€`);
    });
    
    console.log(`📊 Cantidad Total: ${cantidadTotal} uds.`);
    console.log(`💰 Precio Total: ${precioTotal.toFixed(2)} €`);
    console.log(`🆔 MongoDB ID: ${result.insertedId}`);
    console.log(`\n🌐 Accede en: http://localhost:4200/logoadmin/presupuestos/${nextNumero}`);

  } catch (error) {
    console.error('❌ Error creando presupuesto con productos reales:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

createBudgetWithRealProducts();
