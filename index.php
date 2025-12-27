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
  <link rel="stylesheet" href="css/style.css?v=2.1" />
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="logo">
            <h1>BUNKER</h1>
            <p class="tagline">barber studio</p>
        </div>
        <nav class="nav-primary" id="navPrimary">
            <ul class="nav-links">
                <li><a href="#services">Servicios</a></li>
                <li><a href="#contact">Contacto</a></li>
            </ul>
        </nav>
        <div style="display:flex;gap:12px;align-items:center">
            <a href="login.php" class="btn-header" style="background:linear-gradient(135deg,#2a6b8f,#16302b);border-color:var(--accent-copper);">Iniciar Sesión</a>
            <a href="#booking" class="btn-header">Reservar Ahora</a>
        </div>
    </header>

    <!-- Hero -->
    <section class="hero" style="background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('img/fondo.jpg') center/cover no-repeat !important;">
        <div class="hero-content" style="background: rgba(0, 0, 0, 0.4); padding: 20px 30px; border-radius: 10px; backdrop-filter: blur(5px); display: inline-block;">
            <h2 style="color: #d4a574; text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.9); font-size: 3.5em; font-weight: 800; margin: 0;">Experiencia Premium.</h2>
            <p style="color: #f5f3ed; text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9); font-size: 1.3em; font-weight: 500; margin: 10px 0 0 0;">Cortes de calidad y servicios profesionales pensados para ti</p>
        </div>
    </section>

    <!-- Carrusel -->
    <section class="carousel-section">
        <h2 class="section-title">Nuestros Cortes</h2>
        <div class="carousel-container">
            <button class="carousel-btn carousel-prev" id="prevBtn">❮</button>
            <div class="carousel-wrapper">
                <div class="carousel" id="carouselItems">
                    <div class="carousel-item"><img src="img/fade.jpg" alt="Fade Clásico"><h3>Fade Clásico</h3></div>
                    <div class="carousel-item"><img src="img/low taper.jpg" alt="Low Taper"><h3>Low Taper</h3></div>
                    <div class="carousel-item"><img src="img/undercut.jpg" alt="Undercut"><h3>Undercut</h3></div>
                    <div class="carousel-item"><img src="img/mohawk.jpg" alt="Mohawk Moderno"><h3>Mohawk Moderno</h3></div>
                    <div class="carousel-item"><img src="img/texturizado.jpg" alt="Corte Texturizado"><h3>Corte Texturizado</h3></div>
                </div>
            </div>
            <button class="carousel-btn carousel-next" id="nextBtn">❯</button>
        </div>
    </section>

    <!-- Servicios -->
    <section id="services" class="services-section">
        <h2 class="section-title">Nuestros Servicios</h2>
        <div class="services-grid">
            <div class="service-card"><div class="service-number">01</div><h3>Corte</h3><p>Corte clásico con atención personalizada</p><span class="price">$11.000</span><span class="duration">30 minutos</span></div>
            <div class="service-card"><div class="service-number">02</div><h3>Corte + Barba</h3><p>Servicio completo de arreglo facial</p><span class="price">$13.000</span><span class="duration">1.5 horas</span></div>
            <div class="service-card"><div class="service-number">03</div><h3>Barba + ceja </h3><span class="price">$6.000</span><span class="duration">2 horas</span></div>
            <div class="service-card"><div class="service-number">03</div><h3>Afeitado</h3><span class="price">$4.000</span><span class="duration">2 horas</span></div>
            <div class="service-card"><div class="service-number">03</div><h3>Tintura</h3><span class="price">35.000/40.000</span><span class="duration">2 horas</span></div>
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
                        <button type="button" class="barbero-btn" data-barbero="samuel">Samuel Barroso<br><small>(Barbero y Tatuador)</small></button>
                        <button type="button" class="barbero-btn" data-barbero="ale">Ale Alegría<br><small>(Barbero)</small></button>
                        <button type="button" class="barbero-btn" data-barbero="alexis">Alexis<br><small>(Barbero)</small></button>
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
        </div>
    </section>

    <!-- Ubicación -->
    <section id="location" class="location-section">
        <div class="location-container">
            <h2 class="section-title">Nuestra Ubicación</h2>
            <div class="location-content">
                <div class="location-map">
                    <!-- Reemplaza el src con tu URL de Google Maps embed -->
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.88853997739193!2d-66.30235836713537!3d-33.268399070722566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43fc82709156f%3A0xc0bfef49ddea3ea5!2sBarber%C3%ADa%20bunker%20tattoo!5e0!3m2!1ses-419!2sar!4v1764726786118!5m2!1ses-419!2sar"
                        width="100%" 
                        height="450" 
                        style="border:0; border-radius: 12px;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
                <div class="location-info">
                    <div class="info-box">
                        <h3>📍 Dirección</h3>
                        <p>Barrio 157 mza 353 casa 11<br>San Luis , san Luis </p>
                    </div>
                    <div class="info-box">
                        <h3>📞 Contacto</h3>
                        <p>Ale alegria tel: 2664198995<br>Alexis tel: 2665037679<br>Samuel: 2664542161</p>
                    </div>
                    <div class="info-box">
                        <h3>⏰ Horarios De Atención</h3>
                        <p>Lunes a Sabados: 9:00 - 22:00<br></p>
                    </div>
                </div>
            </div>
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

    <script src="js/script.js?v=2.0"></script>
</body>
</html>
