<?php
// Detectar si se acaba de agendar un turno
$reserva_ok = isset($_GET['reserva']) && $_GET['reserva'] === 'ok';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>BUNKER Barber Studio</title>
  <link rel="stylesheet" href="css/style.css?v=1.2" />
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="logo">
            <h1>BUNKER</h1>
            <p class="tagline">barber studio</p>
        </div>
        <nav class="nav-primary" id="navPrimary">
            <button id="navToggle" class="nav-toggle" aria-label="Abrir menú" aria-expanded="false">
                <span class="hamburger"></span>
            </button>
            <ul class="nav-links">
                <li><a href="#services">Servicios</a></li>
                <li><a href="#contact">Contacto</a></li>
                <li class="mobile-reserve"><a href="#booking" class="btn-header-mobile">Reservar Ahora</a></li>
            </ul>
        </nav>
        <div style="display:flex;gap:12px;align-items:center">
            <a href="login.php" class="btn-header" style="background:linear-gradient(135deg,#2a6b8f,#16302b);border-color:var(--accent-copper);">Iniciar Sesión</a>
            <a href="#booking" class="btn-header">Reservar Ahora</a>
        </div>
    </header>

    <!-- Hero -->
    <section class="hero">
        <div class="hero-content">
            <h2>Experiencia Premium.</h2>
            <p>Cortes de calidad y servicios profesionales pensados para ti</p>
        </div>
    </section>

    <!-- Carrusel -->
    <section class="carousel-section">
        <h2 class="section-title">Nuestros Cortes</h2>
        <div class="carousel-container">
            <button class="carousel-btn carousel-prev" id="prevBtn">❮</button>
            <div class="carousel-wrapper">
                <div class="carousel" id="carouselItems">
                    <div class="carousel-item"><img src="img/fade.png" alt="Fade"><h3>Fade Clásico</h3></div>
                    <div class="carousel-item"><img src="img/undercut.png" alt="Undercut"><h3>Undercut</h3></div>
                    <div class="carousel-item"><img src="img/pompadour.png" alt="Pompadour"><h3>Pompadour</h3></div>
                    <div class="carousel-item"><img src="img/mohawk.png" alt="Mohawk"><h3>Mohawk Moderno</h3></div>
                    <div class="carousel-item"><img src="img/texturizado.png" alt="Texturizado"><h3>Corte Texturizado</h3></div>
                </div>
            </div>
            <button class="carousel-btn carousel-next" id="nextBtn">❯</button>
        </div>
    </section>

    <!-- Servicios -->
    <section id="services" class="services-section">
        <h2 class="section-title">Nuestros Servicios</h2>
        <div class="services-grid">
            <div class="service-card"><div class="service-number">01</div><h3>Corte</h3><p>Corte clásico con atención personalizada</p><span class="price">$8.000</span><span class="duration">30 minutos</span></div>
            <div class="service-card"><div class="service-number">02</div><h3>Corte + Barba</h3><p>Servicio completo de arreglo facial</p><span class="price">$9.000</span><span class="duration">1.5 horas</span></div>
            <div class="service-card"><div class="service-number">03</div><h3>Corte + Color</h3><p>Transformación completa con coloración</p><span class="price">Consultar</span><span class="duration">2 horas</span></div>
        </div>
    </section>

    <!-- Reserva -->
    <section id="booking" class="booking-section">
        <div class="booking-container">
            <div class="booking-header">
                <h2>Reserva tu Turno</h2>
                <p>Selecciona tu servicio, fecha y horario preferido</p>
            </div>

            <form class="booking-form" id="bookingForm" action="procesar_reserva.php" method="POST">
                <div class="form-group"><label for="nombre">Nombre</label><input type="text" id="nombre" name="nombre" required /></div>
                <div class="form-group"><label for="apellido">Apellido</label><input type="text" id="apellido" name="apellido" required /></div>
                <div class="form-group"><label for="telefono">Teléfono</label><input type="tel" id="telefono" name="telefono" required /></div>
                <div class="form-group"><label for="servicio">Servicio</label>
                    <select id="servicio" name="servicio" required>
                        <option value="">Selecciona un servicio</option>
                        <option value="corte">Corte (30 min)</option>
                        <option value="corte-barba">Corte + Barba (90 min)</option>
                        <option value="corte-color">Corte + Color (120 min)</option>
                    </select>
                </div>
                <div class="form-group"><label for="fecha">Fecha</label><input type="date" id="fecha" name="fecha" required /></div>
                <div class="form-group">
                    <label>Barbero</label>
                    <input type="hidden" id="barbero" name="barbero" required />
                    <div class="barbero-buttons">
                        <button type="button" class="barbero-btn" data-barbero="carlos">Carlos</button>
                        <button type="button" class="barbero-btn" data-barbero="juan">Juan</button>
                        <button type="button" class="barbero-btn" data-barbero="diego">Diego</button>
                    </div>
                </div>

                <!-- Horarios renderizados por JS -->
                <div class="form-group">
                  <label>Horarios disponibles</label>
                  <div class="horarios-wrapper">
                    <div id="horariosContainer" class="horarios-container" data-horarios-seleccionados=""></div>
                  </div>
                </div>

                <!-- Input oculto para enviar la hora al servidor si se usa envío tradicional -->
                <input type="hidden" id="hora" name="hora" />
                <input type="hidden" id="duracionMinutos" name="duracionMinutos" />

                <div class="form-group"><label for="pago">Método de Pago</label>
                    <select id="pago" name="pago" required>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                    </select>
                </div>

                <!-- Resumen y botón -->
                <div id="resumenReserva" class="booking-summary"></div>
                <button type="submit" class="btn-submit">Confirmar Reserva</button>
            </form>

            <!-- Área para mostrar estado de reservas -->
            <div id="reservasInfo" style="margin-top:18px"></div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2025 Bunker Barber Studio. Todos los derechos reservados.</p>
    </footer>

    <!-- Modal de carga -->
    <div id="loadingModal" class="modal-overlay hidden">
        <div class="modal-content">
            <div class="spinner"></div>
            <p>Cargando tu turno...</p>
        </div>
    </div>

    <!-- Modal de confirmación -->
    <div id="confirmModal" class="modal-overlay <?php echo $reserva_ok ? '' : 'hidden'; ?>">
        <div class="modal-content modal-success">
            <div class="success-icon">✓</div>
            <h2>¡Turno Agendado con Éxito!</h2>
            <div id="confirmDetails">Tu reserva fue registrada correctamente.</div>
            <button class="btn-modal-close" onclick="cerrarModalConfirm()">Cerrar</button>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="toast hidden" role="status" aria-live="polite"></div>

    <script src="js/script.js?v=1.2"></script>
</body>
</html>
