# Logola Backend

Backend API desarrollado con NestJS para el proyecto Logola. Este proyecto utiliza MongoDB como base de datos y está containerizado con Docker.

## 📋 Requisitos previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

## 🚀 Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd back-logola/logolaback
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de plantilla y configura las variables necesarias:
```bash
copy .env.template .env
```

Edita el archivo `.env` con tus configuraciones:
```env
MONGO_URI=mongodb://localhost:27017/nest
JWT_SECRET=tu_jwt_secret_aqui
```

### 4. Levantar la base de datos
Inicia MongoDB usando Docker Compose:
```bash
docker compose up -d
```

Esto levantará:
- MongoDB en el puerto 27017
- Mongo Express (interfaz web) en el puerto 8081 (opcional)

## 🏃‍♂️ Ejecución del proyecto

### Modo desarrollo (recomendado)
Ejecuta el servidor con recarga automática:
```bash
npm run start:dev
```

### Modo producción
Primero construye el proyecto:
```bash
npm run build
```

Luego ejecuta:
```bash
npm run start:prod
```

### Modo debug
Para debugging con breakpoints:
```bash
npm run start:debug
```

## 🧪 Testing

### Ejecutar tests unitarios
```bash
npm run test
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests e2e
```bash
npm run test:e2e
```

### Generar reporte de cobertura
```bash
npm run test:cov
```

## 🔧 Scripts disponibles

- `npm run start` - Inicia el servidor
- `npm run start:dev` - Inicia en modo desarrollo con hot reload
- `npm run start:debug` - Inicia en modo debug
- `npm run start:prod` - Inicia en modo producción
- `npm run build` - Construye el proyecto
- `npm run format` - Formatea el código con Prettier
- `npm run lint` - Ejecuta ESLint
- `npm run test` - Ejecuta los tests
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run test:cov` - Genera reporte de cobertura
- `npm run test:e2e` - Ejecuta tests end-to-end

## 🌐 Endpoints de la API

Una vez iniciado el servidor, estará disponible en:
- **Desarrollo**: `http://localhost:3000`
- **Documentación Swagger**: `http://localhost:3000/api` (si está configurado)

## 🐳 Docker

### Levantar solo la base de datos
```bash
docker compose up -d
```

### Detener los servicios
```bash
docker compose down
```

### Ver logs de los contenedores
```bash
docker compose logs -f
```

## 📁 Estructura del proyecto

```
src/
├── app.module.ts          # Módulo principal
├── main.ts               # Punto de entrada
├── auth/                 # Módulo de autenticación
├── users/                # Módulo de usuarios
└── common/               # Utilidades y decoradores comunes
```

## 🛠️ Tecnologías utilizadas

- **Framework**: NestJS
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Validación**: class-validator
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Containerización**: Docker

## 📝 Notas adicionales

- Asegúrate de que Docker esté ejecutándose antes de levantar la base de datos
- El puerto por defecto es 3000, puedes cambiarlo en las variables de entorno
- Para desarrollo, usa `npm run start:dev` para aprovechar el hot reload

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y no tiene licencia pública.
