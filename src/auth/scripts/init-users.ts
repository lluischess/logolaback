import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AuthService } from '../auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import * as bcryptjs from 'bcryptjs';

// Script para inicializar los 4 usuarios administradores
export async function initializeUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Obtener el modelo de usuario directamente
    const userModel = app.get<Model<User>>('UserModel');
    
    console.log('🗑️  Eliminando todos los usuarios existentes...');
    await userModel.deleteMany({});
    console.log('✅ Usuarios existentes eliminados');

    // Definir los 4 usuarios administradores
    const adminUsers = [
      {
        name: 'Lluis Admin',
        email: 'lluisadmin',
        password: 'JFH83udjjc//0kke-',
        isActive: true
      },
      {
        name: 'Jordi Admin', 
        email: 'jordiadmin',
        password: 'V0lv0-Casamajor',
        isActive: true
      },
      {
        name: 'Anna Admin',
        email: 'annaadmin', 
        password: 'V0lv0-Clemente',
        isActive: true
      },
      {
        name: 'Invitado Admin',
        email: 'invitadoadmin',
        password: 'ijsfoi394dsf-ad!T',
        isActive: true
      }
    ];

    console.log('👥 Creando los 4 usuarios administradores...');
    
    for (const userData of adminUsers) {
      const hashedPassword = bcryptjs.hashSync(userData.password, 10);
      
      const user = new userModel({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isActive: userData.isActive
      });

      await user.save();
      console.log(`✅ Usuario creado: ${userData.email}`);
    }

    console.log('🎉 ¡Todos los usuarios administradores han sido creados exitosamente!');
    console.log('\n📋 Usuarios disponibles:');
    console.log('1. lluisadmin - JFH83udjjc//0kke-');
    console.log('2. jordiadmin - V0lv0-Casamajor'); 
    console.log('3. annaadmin - V0lv0-Clemente');
    console.log('4. invitadoadmin - ijsfoi394dsf-ad!T');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  initializeUsers()
    .then(() => {
      console.log('✅ Script de inicialización completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}
