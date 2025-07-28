const { MongoClient } = require('mongodb');

async function checkDatabase() {
  // Probar diferentes URIs que podría estar usando el backend
  const uris = [
    'mongodb://localhost:27017',
    'mongodb://127.0.0.1:27017',
    'mongodb://localhost:27017/logolaback',
    'mongodb://127.0.0.1:27017/logolaback'
  ];

  for (const uri of uris) {
    console.log(`\n🔍 Probando URI: ${uri}`);
    
    try {
      const client = new MongoClient(uri);
      await client.connect();
      
      // Listar todas las bases de datos
      const adminDb = client.db().admin();
      const databases = await adminDb.listDatabases();
      
      console.log('📊 Bases de datos encontradas:');
      databases.databases.forEach(db => {
        console.log(`  - ${db.name}`);
      });
      
      // Buscar productos en cada base de datos
      for (const dbInfo of databases.databases) {
        const dbName = dbInfo.name;
        if (dbName === 'admin' || dbName === 'local' || dbName === 'config') continue;
        
        console.log(`\n🔍 Verificando base de datos: ${dbName}`);
        const db = client.db(dbName);
        
        // Listar colecciones
        const collections = await db.listCollections().toArray();
        console.log(`  Colecciones: ${collections.map(c => c.name).join(', ')}`);
        
        // Buscar productos
        const productsCollection = db.collection('products');
        const productCount = await productsCollection.countDocuments();
        
        if (productCount > 0) {
          console.log(`  ✅ Encontrados ${productCount} productos en ${dbName}.products`);
          
          // Mostrar algunos productos
          const sampleProducts = await productsCollection.find({}).limit(3).toArray();
          sampleProducts.forEach((product, index) => {
            console.log(`    ${index + 1}. ${product.nombre} (${product.referencia}) - numeroProducto: ${product.numeroProducto || 'NO DEFINIDO'}`);
          });
          
          // Si encontramos productos sin numeroProducto, los actualizamos
          const productsWithoutNumber = await productsCollection.find({ numeroProducto: { $exists: false } }).toArray();
          
          if (productsWithoutNumber.length > 0) {
            console.log(`\n🔧 Actualizando ${productsWithoutNumber.length} productos sin numeroProducto...`);
            
            // Obtener todos los productos ordenados por fecha de creación
            const allProducts = await productsCollection.find({}).sort({ createdAt: 1 }).toArray();
            
            for (let i = 0; i < allProducts.length; i++) {
              const product = allProducts[i];
              const numeroProducto = i + 1;
              
              await productsCollection.updateOne(
                { _id: product._id },
                { $set: { numeroProducto: numeroProducto } }
              );
              
              console.log(`    ✅ ${product.nombre} → Número: ${numeroProducto}`);
            }
            
            console.log('🎉 ¡Todos los productos han sido actualizados con números secuenciales!');
          } else {
            console.log('✅ Todos los productos ya tienen numeroProducto asignado');
          }
        }
      }
      
      await client.close();
      
    } catch (error) {
      console.log(`❌ Error con URI ${uri}: ${error.message}`);
    }
  }
}

checkDatabase();
