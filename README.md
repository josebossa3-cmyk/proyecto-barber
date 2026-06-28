# BUNKER Barber Studio

Sistema de gestión de turnos con frontend HTML/CSS/JS y backend Node.js + Express + PostgreSQL.

## Estructura

```
/
├── config/              # Configuración de base de datos
├── controllers/         # Lógica de turnos y auth
├── models/              # Modelos Sequelize
├── routes/              # Rutas API REST
├── public/              # Frontend estático
│   ├── index.html       # Página principal (cliente)
│   ├── login.html       # Login admin
│   ├── admin/           # Panel administrativo
│   ├── css/
│   └── js/
├── server.js            # Servidor Express
├── start_server.bat     # Inicio rápido en Windows
└── .env                 # Variables de entorno (BD, JWT)
```

## Inicio rápido

1. Instalar dependencias: `npm install`
2. Configurar `.env` con credenciales de PostgreSQL
3. Ejecutar `start_server.bat` o `node server.js`
4. Abrir `http://localhost:3000`

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/turnos` | Crear reserva (público) |
| GET | `/api/turnos/disponibilidad?fecha=&barbero=` | Horarios ocupados |
| POST | `/api/admin/login` | Login administrador |
| GET | `/api/turnos` | Listar turnos (requiere JWT) |
| DELETE | `/api/turnos/:id` | Eliminar turno (requiere JWT) |

## Panel admin

- URL: `http://localhost:3000/login.html`
- Credenciales por defecto: `admin` / `admin123`

## Características

- Reserva online con selección de servicio, barbero, fecha y horario
- Validación de solapamiento de turnos
- Carrusel responsive de estilos
- Panel admin con filtros y estadísticas
