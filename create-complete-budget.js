const { MongoClient } = require('mongodb');

async function createCompleteBudget() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Conectado a MongoDB');

    const db = client.db('logolate');
    const budgetsCollection = db.collection('budgets');

    // Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;

    // Crear presupuesto completo de prueba
    const completeBudget = {
      numeroPedido: `P-${nextNumero}`,
      numeroPresupuesto: nextNumero,
      
      // Datos completos del cliente
      cliente: {
        email: 'maria.garcia@dulcesartesanos.com',
        nombre: 'María García López',
        telefono: '+34 654 321 987',
        direccion: 'Calle Mayor 123, 2º B, 28001 Madrid, España',
        empresa: 'Dulces Artesanos Madrid S.L.',
        detalles: 'Cliente premium. Pedidos regulares cada mes. Prefiere productos sin gluten y veganos. Importante: entregar antes del día 15 de cada mes para eventos corporativos.'
      },

      // Productos con precios completos
      productos: [
        {
          nombre: 'Caramelos Artesanales Premium',
          categoria: 'Caramelos',
          cantidad: 250,
          precioUnitario: 15.50,
          imagen: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400'
        },
        {
          nombre: 'Chocolates Gourmet Variados',
          categoria: 'Chocolates',
          cantidad: 150,
          precioUnitario: 22.75,
          imagen: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400'
        },
        {
          nombre: 'Gominolas Veganas Sin Gluten',
          categoria: 'Gominolas',
          cantidad: 300,
          precioUnitario: 12.90,
          imagen: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400'
        },
        {
          nombre: 'Turrones Artesanales Navideños',
          categoria: 'Turrones',
          cantidad: 100,
          precioUnitario: 28.50,
          imagen: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400'
        }
      ],

      // Estado y fechas
      estado: 'aprobado',
      
      // Logotipo de empresa (imagen real)
      logoEmpresa: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      
      // Configuraciones adicionales
      aceptaCorreosPublicitarios: true,
      
      // Fechas
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insertar el presupuesto
    const result = await budgetsCollection.insertOne(completeBudget);
    
    console.log('✅ Presupuesto completo creado exitosamente:');
    console.log(`📋 Número de Presupuesto: ${nextNumero}`);
    console.log(`🏢 Empresa: ${completeBudget.cliente.empresa}`);
    console.log(`👤 Contacto: ${completeBudget.cliente.nombre}`);
    console.log(`📧 Email: ${completeBudget.cliente.email}`);
    console.log(`📱 Teléfono: ${completeBudget.cliente.telefono}`);
    console.log(`📍 Dirección: ${completeBudget.cliente.direccion}`);
    console.log(`🖼️ Logo: ${completeBudget.logoEmpresa}`);
    console.log(`📦 Productos: ${completeBudget.productos.length}`);
    
    // Calcular totales
    const cantidadTotal = completeBudget.productos.reduce((sum, prod) => sum + prod.cantidad, 0);
    const precioTotal = completeBudget.productos.reduce((sum, prod) => sum + (prod.cantidad * prod.precioUnitario), 0);
    
    console.log(`📊 Cantidad Total: ${cantidadTotal} uds.`);
    console.log(`💰 Precio Total: ${precioTotal.toFixed(2)} €`);
    console.log(`🆔 MongoDB ID: ${result.insertedId}`);
    console.log(`\n🌐 Accede en: http://localhost:4200/logoadmin/presupuestos/${nextNumero}`);

  } catch (error) {
    console.error('❌ Error creando presupuesto completo:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

createCompleteBudget();
