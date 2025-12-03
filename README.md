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
- ✅ Selección de barbero 
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

