const { MongoClient } = require('mongodb');

async function fixTestPresupuestos() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('logolate');
    const budgetsCollection = db.collection('budgets');
    
    // Eliminar los presupuestos incorrectos (#8 y #9)
    await budgetsCollection.deleteMany({ 
      numeroPresupuesto: { $in: [8, 9] }
    });
    console.log('🗑️ Presupuestos incorrectos eliminados');
    
    // Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;
    
    // Presupuesto 1: Panadería Sol Madrid (con IDs reales)
    const presupuesto1 = {
      numeroPresupuesto: nextNumero,
      numeroPedido: `P-${nextNumero}`,
      cliente: {
        email: "maria.gonzalez@panaderiasol.es",
        nombre: "María González López",
        telefono: "+34 612 345 678",
        direccion: "Calle Mayor 15, 28013 Madrid",
        empresa: "Panadería Sol Madrid S.L.",
        detalles: "Cliente mayorista especializado en productos artesanales para eventos corporativos"
      },
      productos: [
        {
          productId: "6883f5fa9271b9431b9addc3", // Caramelos Artesanales Miel
          nombre: "Caramelos Artesanales Miel",
          referencia: "CAR-001",
          cantidad: 50,
          precioUnitario: 2.80,
          subtotal: 140.00
        },
        {
          productId: "6883f4e3e0776e2037449ece", // Bombón Chocolate Premium
          nombre: "Bombón Chocolate Premium",
          referencia: "BOM-001",
          cantidad: 30,
          precioUnitario: 4.50,
          subtotal: 135.00
        }
      ],
      estado: "pendiente",
      logotipoEmpresa: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
      aceptaCorreosPublicitarios: true,
      notas: "Pedido para evento corporativo del 15 de febrero. Entrega preferente en horario de mañana.",
      precioTotal: 275.00,
      fechaVencimiento: new Date("2025-08-15T00:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
      historialEstados: [{
        estado: "pendiente",
        fecha: new Date(),
        notas: "Presupuesto creado"
      }],
      notificacionesEmail: {
        cliente: { enviado: false },
        admin: { enviado: false }
      }
    };
    
    // Presupuesto 2: Cafetería Central Barcelona (con IDs reales)
    const presupuesto2 = {
      numeroPresupuesto: nextNumero + 1,
      numeroPedido: `P-${nextNumero + 1}`,
      cliente: {
        email: "carlos.ruiz@cafeteriacentral.com",
        nombre: "Carlos Ruiz Martínez",
        telefono: "+34 693 847 251",
        direccion: "Passeig de Gràcia 89, 08008 Barcelona",
        empresa: "Cafetería Central Barcelona",
        detalles: "Establecimiento premium en zona turística. Busca productos exclusivos para carta de postres."
      },
      productos: [
        {
          productId: "6883f5fa9271b9431b9addc3", // Caramelos Artesanales Miel
          nombre: "Caramelos Artesanales Miel", 
          referencia: "CAR-001",
          cantidad: 25,
          precioUnitario: 2.80,
          subtotal: 70.00
        },
        {
          productId: "6883f61d9271b9431b9addc7", // Galletas Chocolate Chip
          nombre: "Galletas Chocolate Chip",
          referencia: "GAL-001", 
          cantidad: 20,
          precioUnitario: 3.50,
          subtotal: 70.00
        },
        {
          productId: "688779f61934cffb85d545a9", // Miel
          nombre: "Miel",
          referencia: "MIE-001",
          cantidad: 10,
          precioUnitario: 5.00,
          subtotal: 50.00
        }
      ],
      estado: "en_proceso",
      logotipoEmpresa: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
      aceptaCorreosPublicitarios: false,
      notas: "Cliente VIP. Requiere embalaje premium y certificados de calidad. Entrega los miércoles.",
      precioTotal: 190.00,
      fechaVencimiento: new Date("2025-08-20T00:00:00.000Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
      historialEstados: [
        {
          estado: "pendiente",
          fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
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
    
    // Insertar los presupuestos corregidos
    const result1 = await budgetsCollection.insertOne(presupuesto1);
    const result2 = await budgetsCollection.insertOne(presupuesto2);
    
    console.log('✅ Presupuestos corregidos creados exitosamente:');
    console.log(`📋 Presupuesto 1: #${presupuesto1.numeroPresupuesto} - ${presupuesto1.cliente.empresa}`);
    console.log(`   Productos: Caramelos Miel + Bombón Chocolate Premium`);
    console.log(`📋 Presupuesto 2: #${presupuesto2.numeroPresupuesto} - ${presupuesto2.cliente.empresa}`);
    console.log(`   Productos: Caramelos Miel + Galletas Chocolate + Miel`);
    console.log(`🆔 IDs: ${result1.insertedId}, ${result2.insertedId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixTestPresupuestos();
