const { MongoClient } = require('mongodb');

async function createBudgetWithUpdatedImages() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const productsCollection = db.collection('products');
    const budgetsCollection = db.collection('budgets');

    // 1. Obtener productos reales con imágenes actualizadas
    console.log('📦 Obteniendo productos con imágenes actualizadas...');
    const realProducts = await productsCollection.find({ publicado: true }).toArray();
    
    console.log(`✅ Productos encontrados con imágenes:`);
    realProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.nombre}`);
      console.log(`   Categoría: ${product.categoria}`);
      console.log(`   Precio: ${product.precio}€`);
      console.log(`   Imagen: ${product.imagen || 'NO TIENE IMAGEN'}`);
      console.log('');
    });

    // 2. Seleccionar productos para el presupuesto
    const selectedProducts = realProducts.slice(0, 3); // Solo 3 productos para simplificar

    // 3. Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;

    // 4. Crear presupuesto asegurando que las imágenes se copien correctamente
    const budgetProducts = selectedProducts.map(product => {
      console.log(`🔄 Procesando producto: ${product.nombre}`);
      console.log(`   Imagen original: ${product.imagen}`);
      
      return {
        productoId: product._id,
        nombre: product.nombre,
        categoria: product.categoria,
        cantidad: Math.floor(Math.random() * 100) + 50,
        precioUnitario: product.precio,
        imagen: product.imagen // Asegurar que se copia la imagen actualizada
      };
    });

    const completeBudget = {
      numeroPedido: `P-${nextNumero}`,
      numeroPresupuesto: nextNumero,
      
      cliente: {
        email: 'ana.lopez@pasteleriadeluxe.com',
        nombre: 'Ana López Fernández',
        telefono: '+34 612 345 678',
        direccion: 'Plaza del Carmen 8, 1º, 46003 Valencia, España',
        empresa: 'Pastelería de Luxe Valencia S.L.',
        detalles: 'Cliente VIP. Pedidos especiales para bodas y eventos. Requiere productos premium con presentación especial.'
      },

      productos: budgetProducts,
      estado: 'en_proceso',
      logoEmpresa: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      aceptaCorreosPublicitarios: true,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 5. Insertar el presupuesto
    const result = await budgetsCollection.insertOne(completeBudget);
    
    console.log('\n✅ Nuevo presupuesto con imágenes actualizadas creado:');
    console.log(`📋 Número de Presupuesto: ${nextNumero}`);
    console.log(`🏢 Empresa: ${completeBudget.cliente.empresa}`);
    console.log(`📦 Productos con imágenes:`);
    
    let cantidadTotal = 0;
    let precioTotal = 0;
    
    budgetProducts.forEach((prod, index) => {
      const lineTotal = prod.cantidad * prod.precioUnitario;
      cantidadTotal += prod.cantidad;
      precioTotal += lineTotal;
      console.log(`   ${index + 1}. ${prod.nombre}`);
      console.log(`      Cantidad: ${prod.cantidad} uds.`);
      console.log(`      Precio: ${prod.precioUnitario}€`);
      console.log(`      Total: ${lineTotal.toFixed(2)}€`);
      console.log(`      Imagen: ${prod.imagen}`);
      console.log('');
    });
    
    console.log(`📊 Cantidad Total: ${cantidadTotal} uds.`);
    console.log(`💰 Precio Total: ${precioTotal.toFixed(2)} €`);
    console.log(`\n🌐 Accede en: http://localhost:4200/logoadmin/presupuestos/${nextNumero}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

createBudgetWithUpdatedImages();
