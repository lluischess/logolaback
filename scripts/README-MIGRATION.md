# 🔄 Script de Migración de URLs

## Descripción

Este script actualiza todas las URLs almacenadas en MongoDB de `https://new.logolate.com` a `https://www.logolate.com`.

## Colecciones Afectadas

- ✅ **configurations**: Logos, banners, imágenes SEO
- ✅ **products**: Imágenes de productos, ogImagen
- ✅ **categories**: Imágenes de categorías
- ✅ **budgets**: Imágenes en presupuestos

## 📋 Requisitos Previos

1. Node.js instalado
2. Acceso a MongoDB (Atlas)
3. Variable de entorno `MONGO_URI` configurada o usar la URI hardcodeada en el script

## 🚀 Ejecución

### Opción 1: Con ts-node (Recomendado)

```bash
# Desde la raíz del proyecto backend
cd c:/Angular/back-logola/logolaback

# Instalar ts-node si no lo tienes
npm install -g ts-node

# Ejecutar el script
npx ts-node scripts/migrate-urls.ts
```

### Opción 2: Compilar y ejecutar

```bash
# Compilar TypeScript a JavaScript
npx tsc scripts/migrate-urls.ts --lib es2015,dom --module commonjs

# Ejecutar el JavaScript generado
node scripts/migrate-urls.js
```

### Opción 3: Desde Render.com

1. Abre la terminal de Render
2. Navega a la carpeta del proyecto
3. Ejecuta: `npx ts-node scripts/migrate-urls.ts`

## ⚠️ Importante

- **HACER BACKUP** de la base de datos antes de ejecutar (opcional pero recomendado)
- El script es **idempotente**: puedes ejecutarlo varias veces sin problemas
- Verifica los resultados revisando algunos documentos en MongoDB Atlas

## 📊 Salida Esperada

```
==================================================
🚀 INICIANDO MIGRACIÓN DE URLs
==================================================
📍 De: https://new.logolate.com
📍 A:  https://www.logolate.com
==================================================

🔌 Conectando a MongoDB...
✅ Conectado a MongoDB

📝 Migrando colección: configurations
   ✅ Configuraciones actualizadas: 3

📦 Migrando colección: products
   ✅ Productos actualizados: 15

📂 Migrando colección: categories
   ✅ Categorías actualizadas: 5

💰 Migrando colección: budgets
   ✅ Presupuestos actualizados: 2

==================================================
✅ MIGRACIÓN COMPLETADA CON ÉXITO
==================================================
📊 Total de documentos actualizados:
   • Configuraciones: 3
   • Productos: 15
   • Categorías: 5
   • Presupuestos: 2
   • TOTAL: 25
==================================================

🔄 Todas las URLs han sido migradas de:
   https://new.logolate.com
   👇
   https://www.logolate.com

🔌 Desconectado de MongoDB
```

## 🔍 Verificación Post-Migración

Después de ejecutar el script:

1. Revisa MongoDB Atlas manualmente
2. Busca documentos con `new.logolate.com` - no deberían existir
3. Verifica que las imágenes se cargan correctamente en www.logolate.com
4. Comprueba el backoffice para confirmar que las imágenes aparecen

## 🆘 Troubleshooting

### Error: "Cannot find module 'mongoose'"

```bash
npm install mongoose
```

### Error: "Cannot connect to MongoDB"

Verifica que la URI de MongoDB sea correcta en el script o en `.env.production`

### El script no encuentra documentos

Es posible que ya hayan sido migrados. Verifica manualmente en MongoDB Atlas.

## 📞 Soporte

Si encuentras problemas, verifica:
- La conexión a MongoDB
- Los permisos de escritura en la base de datos
- Los logs del script para identificar errores específicos
