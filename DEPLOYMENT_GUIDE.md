# Guía de Despliegue - Backend Logola en Render

## 📋 Preparativos Completados

✅ Variables de entorno configuradas (`.env.development` y `.env.production`)  
✅ Scripts de package.json configurados para desarrollo y producción  
✅ Configuración de MongoDB Atlas lista  
✅ Archivos de deployment creados (`Dockerfile`, `render.yaml`)  
✅ CORS configurado para producción  

## 🚀 Pasos para Desplegar en Render

### 1. Crear Cuenta en Render
- Ve a [render.com](https://render.com)
- Regístrate con tu cuenta de GitHub/GitLab o email
- Confirma tu email si es necesario

### 2. Conectar Repositorio
- Haz clic en "New +" → "Web Service"
- Conecta tu cuenta de GitHub/GitLab
- Selecciona el repositorio del backend (`back-logola/logolaback`)
- Autoriza el acceso a Render

### 3. Configurar el Servicio

#### Configuración Básica:
- **Name**: `logola-backend` (o el nombre que prefieras)
- **Region**: `Frankfurt (EU Central)` (más cercano a España)
- **Branch**: `main` (o tu rama principal)
- **Root Directory**: Dejar vacío si el backend está en la raíz, o poner la ruta relativa
- **Runtime**: `Node`

#### Configuración de Build:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### Plan:
- Selecciona **"Free"** para empezar (0$/mes, con limitaciones)
- Puedes actualizar más tarde si necesitas más recursos

### 4. Configurar Variables de Entorno

En la sección "Environment Variables", añade las siguientes variables:

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://tu-usuario:tu-password@cluster0.xxxxx.mongodb.net/logola?retryWrites=true&w=majority
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
FRONTEND_URL=https://new.logolate.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion-gmail
EMAIL_FROM=noreply@logolate.com
```

**⚠️ IMPORTANTE**: 
- Usa la cadena de conexión de MongoDB Atlas que ya tienes configurada
- El `JWT_SECRET` debe ser una cadena larga y segura
- Para Gmail, usa una "Contraseña de Aplicación", no tu contraseña normal

### 5. Configurar Email (Gmail)

Para que funcionen las notificaciones por email:

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Seguridad → Verificación en 2 pasos (actívala si no está)
3. Seguridad → Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña de 16 caracteres en `EMAIL_PASSWORD`

### 6. Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar automáticamente
3. El proceso toma entre 5-10 minutos la primera vez
4. Una vez completado, tendrás una URL como: `https://logola-backend.onrender.com`

### 7. Verificar el Despliegue

#### Comprobar que funciona:
- Ve a `https://tu-app.onrender.com/` (debería responder)
- Prueba un endpoint: `https://tu-app.onrender.com/auth/test` o similar

#### Ver logs:
- En el dashboard de Render, ve a "Logs" para ver errores
- Los logs te ayudarán a diagnosticar problemas

### 8. Actualizar Frontend

Una vez que tengas la URL del backend desplegado:

1. Ve a `C:\Angular\angular-logola\angular-logola\src\environments\environment.prod.ts`
2. Actualiza la `apiUrl`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.onrender.com'
};
```
3. Haz un nuevo build: `npm run build`
4. Sube los archivos actualizados a Hostinger

### 9. Configurar Dominio Personalizado (Opcional)

Si quieres usar un subdominio como `api.logolate.com`:

1. En Render, ve a "Settings" → "Custom Domains"
2. Añade `api.logolate.com`
3. Configura un CNAME en tu DNS apuntando a la URL de Render
4. Render configurará SSL automáticamente

## 🔧 Solución de Problemas Comunes

### Error de Build
- **Problema**: `npm install` falla
- **Solución**: Verifica que `package.json` esté en la raíz correcta

### Error de Conexión a MongoDB
- **Problema**: No puede conectar a Atlas
- **Solución**: Verifica que `MONGO_URI` esté correcta y que la IP de Render esté permitida en Atlas (0.0.0.0/0 para permitir todas)

### Error de CORS
- **Problema**: Frontend no puede hacer peticiones
- **Solución**: Verifica que `FRONTEND_URL` esté configurada correctamente

### Error de Email
- **Problema**: No se envían emails
- **Solución**: Verifica que uses una "Contraseña de Aplicación" de Gmail, no tu contraseña normal

### App "Duerme" (Plan Free)
- **Problema**: La app se duerme tras 15 minutos de inactividad
- **Solución**: Considera actualizar al plan Starter ($7/mes) o usa un servicio de "ping" externo

## 📊 Monitoreo

### Logs en Tiempo Real
- Dashboard de Render → "Logs"
- Útil para debugging y monitoreo

### Métricas
- Dashboard de Render → "Metrics"
- CPU, memoria, requests por minuto

### Alertas
- Configura notificaciones por email si la app falla

## 🔄 Actualizaciones Futuras

### Deploy Automático
- Cada push a la rama `main` desplegará automáticamente
- Puedes desactivar esto en Settings si prefieres control manual

### Deploy Manual
- Dashboard → "Manual Deploy" → "Deploy Latest Commit"

## 💡 Consejos de Producción

1. **Monitorea los logs** regularmente
2. **Configura alertas** para fallos
3. **Usa variables de entorno** para todos los secretos
4. **Mantén backups** de tu base de datos MongoDB
5. **Considera el plan Starter** si necesitas más estabilidad

---

¡Tu backend estará listo en Render siguiendo estos pasos! 🎉
