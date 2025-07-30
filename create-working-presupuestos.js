const { MongoClient, ObjectId } = require('mongodb');

async function createWorkingPresupuestos() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('logolate');
    const budgetsCollection = db.collection('budgets');
    const productsCollection = db.collection('products');
    
    // Eliminar presupuestos problemáticos
    await budgetsCollection.deleteMany({ numeroPresupuesto: { $in: [8, 9] } });
    console.log('🗑️ Presupuestos problemáticos eliminados');
    
    // Obtener productos reales de la base de datos
    const products = await productsCollection.find({}).limit(3).toArray();
    console.log('📦 Productos encontrados:', products.map(p => ({ id: p._id, nombre: p.nombre })));
    
    if (products.length < 2) {
      throw new Error('No hay suficientes productos en la base de datos');
    }
    
    // Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;
    
    // Presupuesto 1: Simple con 2 productos
    const presupuesto1 = {
      numeroPresupuesto: nextNumero,
      numeroPedido: `P-${nextNumero}`,
      cliente: {
        email: "test1@ejemplo.com",
        nombre: "Cliente Test 1",
        telefono: "+34 600 111 222",
        direccion: "Calle Test 1, Madrid",
        empresa: "Empresa Test 1 S.L.",
        detalles: "Cliente de prueba para validar funcionalidad"
      },
      productos: [
        {
          productId: products[0]._id.toString(), // Usar toString() explícitamente
          nombre: products[0].nombre,
          referencia: "REF-001",
          cantidad: 10,
          precioUnitario: 5.00,
          subtotal: 50.00
        },
        {
          productId: products[1]._id.toString(), // Usar toString() explícitamente
          nombre: products[1].nombre,
          referencia: "REF-002",
          cantidad: 5,
          precioUnitario: 8.00,
          subtotal: 40.00
        }
      ],
      estado: "pendiente",
      logotipoEmpresa: "https://via.placeholder.com/300x200/4CAF50/white?text=Test1",
      aceptaCorreosPublicitarios: true,
      notas: "Presupuesto de prueba 1 - Validación de funcionalidad",
      precioTotal: 90.00,
      fechaVencimiento: new Date("2025-08-30T00:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
      historialEstados: [{
        estado: "pendiente",
        fecha: new Date(),
        notas: "Presupuesto creado para pruebas"
      }],
      notificacionesEmail: {
        cliente: { enviado: false },
        admin: { enviado: false }
      }
    };
    
    // Presupuesto 2: Con 3 productos si hay suficientes
    const presupuesto2 = {
      numeroPresupuesto: nextNumero + 1,
      numeroPedido: `P-${nextNumero + 1}`,
      cliente: {
        email: "test2@ejemplo.com",
        nombre: "Cliente Test 2",
        telefono: "+34 600 333 444",
        direccion: "Calle Test 2, Barcelona",
        empresa: "Empresa Test 2 S.L.",
        detalles: "Cliente de prueba para validar edición y guardado"
      },
      productos: [
        {
          productId: products[0]._id.toString(),
          nombre: products[0].nombre,
          referencia: "REF-003",
          cantidad: 20,
          precioUnitario: 3.50,
          subtotal: 70.00
        },
        {
          productId: products[1]._id.toString(),
          nombre: products[1].nombre,
          referencia: "REF-004",
          cantidad: 15,
          precioUnitario: 6.00,
          subtotal: 90.00
        }
      ],
      estado: "en_proceso",
      logotipoEmpresa: "https://via.placeholder.com/300x200/2196F3/white?text=Test2",
      aceptaCorreosPublicitarios: false,
      notas: "Presupuesto de prueba 2 - Validación de edición",
      precioTotal: 160.00,
      fechaVencimiento: new Date("2025-09-15T00:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
      historialEstados: [
        {
          estado: "pendiente",
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
          notas: "Presupuesto creado"
        },
        {
          estado: "en_proceso",
          fecha: new Date(),
          notas: "Presupuesto en proceso de preparación"
        }
      ],
      notificacionesEmail: {
        cliente: { enviado: true, fechaEnvio: new Date() },
        admin: { enviado: true, fechaEnvio: new Date() }
      }
    };
    
    // Si hay un tercer producto, añadirlo al presupuesto 2
    if (products.length >= 3) {
      presupuesto2.productos.push({
        productId: products[2]._id.toString(),
        nombre: products[2].nombre,
        referencia: "REF-005",
        cantidad: 8,
        precioUnitario: 4.25,
        subtotal: 34.00
      });
      presupuesto2.precioTotal = 194.00;
    }
    
    // Insertar los presupuestos
    const result1 = await budgetsCollection.insertOne(presupuesto1);
    const result2 = await budgetsCollection.insertOne(presupuesto2);
    
    console.log('✅ Presupuestos de prueba creados exitosamente:');
    console.log(`📋 Presupuesto #${presupuesto1.numeroPresupuesto} - ${presupuesto1.cliente.empresa}`);
    console.log(`   Productos: ${presupuesto1.productos.map(p => p.nombre).join(', ')}`);
    console.log(`   IDs usados: ${presupuesto1.productos.map(p => p.productId).join(', ')}`);
    console.log(`📋 Presupuesto #${presupuesto2.numeroPresupuesto} - ${presupuesto2.cliente.empresa}`);
    console.log(`   Productos: ${presupuesto2.productos.map(p => p.nombre).join(', ')}`);
    console.log(`   IDs usados: ${presupuesto2.productos.map(p => p.productId).join(', ')}`);
    console.log(`🆔 MongoDB IDs: ${result1.insertedId}, ${result2.insertedId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createWorkingPresupuestos();
