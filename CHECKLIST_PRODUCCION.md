# ✅ CHECKLIST PARA SUBIR A HOSTING

## 🔒 SEGURIDAD CRÍTICA

### 1. Cambiar credenciales de admin
📍 **Archivo:** `includes/funciones.php`
```php
// ⚠️ CAMBIAR ESTAS CREDENCIALES ANTES DE SUBIR
if ($usuario === 'admin' && $password === '12345') {
```
**Acción:** Usa credenciales fuertes y considera hashear la contraseña con `password_hash()`

### 2. Configurar base de datos del hosting
📍 **Archivo:** `includes/config.php`
```php
$host = 'localhost';           // Cambiar según hosting
$usuario = 'root';             // ⚠️ Usuario de MySQL del hosting
$password = '';                // ⚠️ Password de MySQL del hosting
$basedatos = 'turnos';         // Nombre de la BD en hosting
```

### 3. Desactivar errores PHP en producción
📍 **Crear archivo:** `.htaccess` en la raíz
```apache
# Desactivar display de errores
php_flag display_errors off
php_flag display_startup_errors off
php_value error_reporting 0

# Solo loguear errores
php_flag log_errors on
php_value error_log /ruta/a/logs/php_errors.log

# Seguridad adicional
Options -Indexes
```

### 4. Proteger archivos sensibles
📍 **Agregar a `.htaccess`:**
```apache
# Bloquear acceso a archivos sensibles
<FilesMatch "^(config\.php|funciones\.php|\.sql|\.md|CHECKLIST)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

## 📁 ESTRUCTURA DE ARCHIVOS

### 5. Crear carpeta de logs
```
/logs/
  - php_errors.log  (permisos 644)
```

### 6. Importar base de datos
1. Exportar desde XAMPP: `conexion_base.sql`
2. Importar en cPanel/phpMyAdmin del hosting
3. Verificar que todas las tablas existan

## 🌐 CONFIGURACIÓN DEL HOSTING

### 7. Configurar PHP (mínimo requerido)
- **PHP Version:** 7.4 o superior (recomendado 8.0+)
- **MySQL Version:** 5.7 o superior
- **Extensiones requeridas:**
  - mysqli
  - session
  - json

### 8. Permisos de archivos
```
Archivos PHP:     644
Directorios:      755
config.php:       600 (más restrictivo)
```

### 9. SSL/HTTPS
- ✅ Activar certificado SSL en el hosting (Let's Encrypt gratis)
- ✅ Forzar HTTPS en `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🧪 TESTING POST-DEPLOYMENT

### 10. Verificar después de subir:
- [ ] Login admin funciona
- [ ] Crear turno desde cliente funciona
- [ ] Validación de fechas (solo hoy hasta hoy+2)
- [ ] Filtros de barbero en admin funcionan
- [ ] Botón de limpiar cache funciona
- [ ] Editar/Eliminar turnos funciona
- [ ] Consulta de turnos ocupados funciona

## 🔄 MANTENIMIENTO

### 11. Actualizar versiones de cache
Cuando modifiques CSS o JS, cambia el número de versión:
```php
<link rel="stylesheet" href="css/style.css?v=1.3">
<script src="js/script.js?v=1.3"></script>
```

### 12. Backup regular
- Exportar BD semanalmente
- Descargar archivos importantes
- Considerar usar Git para control de versiones

## 📱 OPTIMIZACIÓN OPCIONAL

### 13. Performance
- ✅ Ya tienes: Queries optimizadas
- ✅ Ya tienes: Cache busting
- Considera: Comprimir CSS/JS con herramientas online
- Considera: Optimizar imágenes si agregas

### 14. SEO Básico
```html
<meta name="description" content="BUNKER Barber Studio - Reserva tu turno online">
<meta name="keywords" content="barbería, corte, barba, reservas">
```

## 🚨 ERRORES COMUNES AL MIGRAR

1. **Error de conexión a BD:**
   - Verifica credenciales en `config.php`
   - Confirma que el usuario tenga permisos en la BD

2. **Sesiones no funcionan:**
   - Verifica que `session.save_path` tenga permisos de escritura
   - Algunos hostings requieren configuración especial

3. **Rutas rotas:**
   - Si subes a un subdirectorio (ej: `/barberia/`), actualiza rutas
   - Usa rutas relativas o absolutas según corresponda

4. **Cache persistente:**
   - Limpia cache del navegador (Ctrl+Shift+R)
   - Verifica que `?v=1.2` esté en todos los archivos

## 📋 RESUMEN RÁPIDO

**ANTES de subir:**
1. Cambiar credenciales admin
2. Crear `.htaccess` con protecciones
3. Preparar `config.php` con datos del hosting

**DESPUÉS de subir:**
1. Importar base de datos
2. Configurar permisos (644/755)
3. Activar SSL/HTTPS
4. Probar todas las funcionalidades

---

**🎯 Tu proyecto está 95% listo. Solo necesitas ajustar credenciales y configuración del hosting.**
