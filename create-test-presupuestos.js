const { MongoClient } = require('mongodb');

async function createTestPresupuestos() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('logolate');
    const budgetsCollection = db.collection('budgets');
    
    // Obtener el siguiente número de presupuesto
    const lastBudget = await budgetsCollection.findOne({}, { sort: { numeroPresupuesto: -1 } });
    const nextNumero = lastBudget ? lastBudget.numeroPresupuesto + 1 : 1;
    
    // Presupuesto 1: Panadería Sol Madrid
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
          productId: "6883f5fa9271b9431b9addc3",
          nombre: "Caramelos Artesanales Miel",
          referencia: "CAR-001",
          cantidad: 50,
          precioUnitario: 2.80,
          subtotal: 140.00
        },
        {
          productId: "6883f5fa9271b9431b9addc4", 
          nombre: "Bombones Premium Chocolate",
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
    
    // Presupuesto 2: Cafetería Central Barcelona
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
          productId: "6883f5fa9271b9431b9addc3",
          nombre: "Caramelos Artesanales Miel", 
          referencia: "CAR-001",
          cantidad: 25,
          precioUnitario: 2.80,
          subtotal: 70.00
        },
        {
          productId: "6883f5fa9271b9431b9addc4",
          nombre: "Bombones Premium Chocolate",
          referencia: "BOM-001", 
          cantidad: 40,
          precioUnitario: 4.50,
          subtotal: 180.00
        },
        {
          productId: "6883f5fa9271b9431b9addc5",
          nombre: "Turrones Artesanos",
          referencia: "TUR-001",
          cantidad: 15,
          precioUnitario: 6.20,
          subtotal: 93.00
        }
      ],
      estado: "en_proceso",
      logotipoEmpresa: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
      aceptaCorreosPublicitarios: false,
      notas: "Cliente VIP. Requiere embalaje premium y certificados de calidad. Entrega los miércoles.",
      precioTotal: 343.00,
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
    
    // Insertar los presupuestos
    const result1 = await budgetsCollection.insertOne(presupuesto1);
    const result2 = await budgetsCollection.insertOne(presupuesto2);
    
    console.log('✅ Presupuestos de prueba creados exitosamente:');
    console.log(`📋 Presupuesto 1: #${presupuesto1.numeroPresupuesto} - ${presupuesto1.cliente.empresa}`);
    console.log(`📋 Presupuesto 2: #${presupuesto2.numeroPresupuesto} - ${presupuesto2.cliente.empresa}`);
    console.log(`🆔 IDs: ${result1.insertedId}, ${result2.insertedId}`);
    
  } catch (error) {
    console.error('❌ Error creando presupuestos:', error);
  } finally {
    await client.close();
  }
}

createTestPresupuestos();
