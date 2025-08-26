# Ejecutar Scripts de Base de Datos

Para resolver el error "Could not find the table 'public.workspaces'", necesitas ejecutar los siguientes scripts SQL en tu base de datos de Supabase:

## Pasos para ejecutar los scripts:

### Opción 1: Usar v0 (Recomendado)
1. Haz clic en el botón "Run Script" que aparece en la interfaz de v0
2. Ejecuta los scripts en este orden:
   - `scripts/001_create_database_schema.sql`
   - `scripts/002_create_profile_trigger.sql`

### Opción 2: Usar Supabase Dashboard
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a "SQL Editor" en el menú lateral
3. Copia y pega el contenido de `scripts/001_create_database_schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Repite el proceso con `scripts/002_create_profile_trigger.sql`

## ¿Qué crean estos scripts?

### Script 001 - Esquema Principal:
- Tabla `profiles` - Perfiles de usuario
- Tabla `workspaces` - Espacios de trabajo
- Tabla `workspace_members` - Miembros de espacios de trabajo
- Tabla `campaigns` - Campañas de marketing
- Tabla `content_pieces` - Piezas de contenido
- Políticas RLS para seguridad

### Script 002 - Trigger de Perfiles:
- Función para crear perfiles automáticamente
- Trigger que se ejecuta cuando se registra un nuevo usuario

## Verificación
Después de ejecutar los scripts, deberías poder:
- Crear workspaces sin errores
- Ver las tablas en tu base de datos de Supabase
- Usar todas las funcionalidades de la aplicación

Si sigues teniendo problemas, verifica que los scripts se ejecutaron correctamente en el SQL Editor de Supabase.
