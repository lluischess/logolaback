const fetch = require('node-fetch');

async function generateToken() {
  try {
    console.log('🔐 Generando token de autenticación...');
    
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'lluisadmin',
        password: 'JFH83udjjc//0kke-'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token generado exitosamente:');
      console.log(data.access_token);
      console.log('');
      console.log('🔗 Para probar endpoint enriquecido:');
      console.log(`curl -H "Authorization: Bearer ${data.access_token}" http://localhost:3000/budgets/numero/7/enriched`);
      console.log('');
      console.log('📋 Para usar en localStorage del navegador:');
      console.log(`localStorage.setItem('authToken', '${data.access_token}');`);
      
      // Probar el endpoint enriquecido inmediatamente
      console.log('');
      console.log('🧪 Probando endpoint enriquecido...');
      const enrichedResponse = await fetch('http://localhost:3000/budgets/numero/7/enriched', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (enrichedResponse.ok) {
        const enrichedData = await enrichedResponse.json();
        console.log('✅ Endpoint enriquecido funciona correctamente');
        console.log('📦 Productos con imágenes:');
        enrichedData.productos?.forEach((prod, i) => {
          console.log(`${i+1}. ${prod.producto?.nombre || 'Sin nombre'}`);
          console.log(`   - Imagen: ${prod.producto?.imagen || 'SIN IMAGEN'}`);
          console.log(`   - Categoría: ${prod.producto?.categoria?.nombre || 'Sin categoría'}`);
        });
      } else {
        console.log(`❌ Error en endpoint enriquecido: ${enrichedResponse.status}`);
      }
      
    } else {
      console.log(`❌ Error generando token: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateToken();
