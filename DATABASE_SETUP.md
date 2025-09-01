# Configuración de Base de Datos - MediaPlan AI

## Error: "Could not find the table 'public.workspaces' in the schema cache"

Este error indica que las tablas de la base de datos no han sido creadas. Sigue estos pasos para configurar la base de datos:

## Pasos para Ejecutar los Scripts SQL

### 1. Ejecutar Script Principal (REQUERIDO)
Ejecuta el script `scripts/001_create_database_schema.sql` primero:
- Este script crea todas las tablas principales: profiles, workspaces, workspace_members, campaigns, content_pieces
- También configura las políticas de Row Level Security (RLS)

### 2. Ejecutar Script de Triggers (REQUERIDO)
Ejecuta el script `scripts/002_create_profile_trigger.sql`:
- Crea el trigger automático para crear perfiles de usuario
- Esencial para el funcionamiento del sistema de autenticación

### 3. Ejecutar Script de Redes Sociales (OPCIONAL)
Ejecuta el script `scripts/003_add_social_media_connections.sql`:
- Añade funcionalidad de conexiones con redes sociales
- Necesario solo si planeas usar la integración social

### 4. Ejecutar Script de Ireal (OPCIONAL)
Ejecuta el script `scripts/004_ireal_specific_features.sql`:
- Añade funcionalidades específicas para Ireal
- Necesario solo si planeas usar las características de Ireal

## Cómo Ejecutar los Scripts

### Opción 1: Desde v0 (Recomendado)
1. Haz clic en el botón "Run Script" para cada archivo en orden
2. Espera a que cada script se complete antes del siguiente

### Opción 2: Desde Supabase Dashboard
1. Ve a tu proyecto en Supabase
2. Navega a SQL Editor
3. Copia y pega el contenido de cada script
4. Ejecuta en orden: 001 → 002 → 003 → 004

## Verificación
Después de ejecutar los scripts, deberías poder:
- Crear workspaces sin errores
- Ver las tablas en tu base de datos Supabase
- Usar todas las funcionalidades de la plataforma
- Utilizar las características específicas de Ireal si los scripts correspondientes fueron ejecutados

## Troubleshooting
Si sigues teniendo problemas:
1. Verifica que tienes permisos de administrador en Supabase
2. Asegúrate de que los scripts se ejecutaron completamente
3. Revisa los logs de Supabase para errores específicos
