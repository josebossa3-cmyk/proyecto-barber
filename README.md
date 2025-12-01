# 💈 BUNKER Barber Studio - Sistema de Reservas

Sistema de gestión de turnos para barbería con panel administrativo completo.

## 📁 Estructura del Proyecto

```
/
├── admin/                      # Panel administrativo
│   ├── agregar.php            # Agregar nuevo turno
│   ├── dashboard.php          # Panel principal
│   ├── editar.php             # Editar turno existente
│   ├── eliminar.php           # Eliminar turno
│   └── logout.php             # Cerrar sesión
├── css/
│   └── style.css              # Estilos principales
├── includes/
│   ├── config.php             # Configuración BD
│   └── funciones.php          # Funciones auxiliares
├── js/
│   └── script.js              # Lógica cliente (reservas, horarios)
├── index.php                  # Vista cliente principal
├── login.php                  # Login administrativo
├── logout.php                 # Logout general
├── procesar_login.php         # Procesamiento login
├── procesar_reserva.php       # API: crear reserva
├── consultar_turnos.php       # API: consultar disponibilidad
├── limpiar_cache.html         # Utilidad: limpiar localStorage
├── conexion_base.sql          # Script BD inicial
└── upgrade_turnos.sql         # Script actualización BD
```

## 🚀 Características Principales

### Vista Cliente
- ✅ Selección de servicio (Corte, Corte + Barba, Corte + Color)
- ✅ Selección de barbero (Carlos, Juan, Diego)
- ✅ Fecha mínima: hoy + 2 días
- ✅ Horarios disponibles en tiempo real (09:00 - 21:00)
- ✅ Prevención de reservas duplicadas/solapadas
- ✅ Validación de teléfono (mínimo 7 dígitos)
- ✅ Métodos de pago: Efectivo / Transferencia
- ✅ Sincronización con base de datos MySQL

### Panel Administrativo
- ✅ Login seguro con sesiones PHP
- ✅ Dashboard con listado de turnos
- ✅ Agregar turno (misma interfaz que cliente)
- ✅ Editar turnos existentes
- ✅ Eliminar turnos
- ✅ Sincronización completa con vista cliente

## 🔧 Configuración de Servicios

```javascript
Corte:         30 minutos
Corte + Barba: 90 minutos
Corte + Color: 120 minutos
```

## 🕐 Horarios de Atención

- **Apertura:** 09:00
- **Cierre:** 21:00
- **Slots:** Cada 30 minutos

## 📊 Base de Datos

### Tabla: `turnos`
```sql
- id (INT, AUTO_INCREMENT)
- cliente (VARCHAR)
- telefono (VARCHAR)
- servicio (VARCHAR)
- fecha (DATE)
- hora (TIME)
- barbero (VARCHAR)
- pago (VARCHAR)
- duracionMinutos (INT)
- fecha_creacion (TIMESTAMP)
```

### Tabla: `administradores`
```sql
- id (INT, AUTO_INCREMENT)
- usuario (VARCHAR)
- clave (VARCHAR)
- fecha_creacion (TIMESTAMP)
```

## 🔐 Validaciones

### Backend (procesar_reserva.php)
- ✅ Todos los campos requeridos
- ✅ Teléfono: mínimo 7 dígitos numéricos
- ✅ Fecha: formato YYYY-MM-DD, mínimo hoy+2 días
- ✅ Hora: formato HH:MM, rango 09:00-21:00
- ✅ Servicio: normalización y validación
- ✅ Barbero: whitelist (carlos, juan, diego)
- ✅ Pago: whitelist (efectivo, transferencia)
- ✅ Prevención de solapamientos

### Frontend (script.js)
- ✅ Consulta en tiempo real de disponibilidad
- ✅ Sincronización con localStorage
- ✅ Validación de formularios
- ✅ Feedback visual (toast, modales)

## 🌐 Endpoints API

### POST /procesar_reserva.php
Crea una nueva reserva.

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "1234567890",
  "servicio": "corte",
  "fecha_iso": "2025-12-03",
  "horario": "10:00",
  "barbero": "carlos",
  "pago": "efectivo"
}
```

**Response (Success):**
```json
{
  "success": true,
  "id_turno": 123,
  "mensaje": "Turno registrado exitosamente"
}
```

### GET /consultar_turnos.php
Consulta turnos ocupados para una fecha y barbero.

**Request:**
```
GET /consultar_turnos.php?fecha_iso=2025-12-03&barbero=carlos
```

**Response:**
```json
{
  "success": true,
  "turnos": [
    {
      "hora": "10:00",
      "duracionMinutos": 30
    }
  ]
}
```

## 🛠️ Instalación

1. **Clonar/Descargar el proyecto**
2. **Importar base de datos:**
   ```bash
   mysql -u root -p barberia < conexion_base.sql
   ```
3. **Configurar conexión** en `includes/config.php`
4. **Acceder:**
   - Cliente: `http://localhost/prueba conexion php/`
   - Admin: `http://localhost/prueba conexion php/login.php`

## 🔑 Credenciales Admin (Por Defecto)

```
Usuario: admin
Contraseña: admin
```

⚠️ **Cambiar en producción**

## 🧹 Mantenimiento

### Limpiar Cache del Navegador
Si hay problemas con turnos fantasma:
1. Abrir: `http://localhost/prueba conexion php/limpiar_cache.html`
2. Hacer clic en "Limpiar Cache Ahora"

### Actualizar Base de Datos
Si se realizaron cambios en la estructura:
```bash
mysql -u root -p barberia < upgrade_turnos.sql
```

## 📝 Código Limpio

✅ Sin console.log de debug
✅ Sin comentarios obsoletos
✅ Sin código comentado innecesario
✅ Sin archivos de prueba
✅ Estructura clara y organizada
✅ Nombres de variables descriptivos
✅ Validaciones consistentes
✅ Sin código inalcanzable

## 🎨 Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 8.x
- **Base de Datos:** MySQL 8.x
- **Servidor:** Apache (XAMPP)

## 📱 Responsive

- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔄 Flujo de Reserva

1. Cliente completa formulario
2. JS valida y consulta disponibilidad (`consultar_turnos.php`)
3. Cliente selecciona horario disponible
4. JS envía datos a `procesar_reserva.php`
5. Backend valida, verifica solapamientos e inserta en BD
6. Cliente recibe confirmación
7. LocalStorage se sincroniza con BD

## 🎯 Próximas Mejoras Posibles

- [ ] Notificaciones por email/SMS
- [ ] Recordatorios automáticos
- [ ] Reportes y estadísticas
- [ ] Gestión de precios
- [ ] Sistema de roles (admin/recepcionista)
- [ ] API REST completa
- [ ] Integración con calendarios externos

---

**Versión:** 2.0 (Código Limpio)
**Última actualización:** Diciembre 2025
