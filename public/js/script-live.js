// Sistema de Gestión de Turnos - Bunker Barber (Live Server Version)
// Funciona 100% con localStorage, sin necesidad de backend

// ==================== CONFIGURACIÓN ====================
const SERVICIOS = {
  corte: { nombre: "Corte", duracion: 0.5 },
  "corte-barba": { nombre: "Corte + Barba", duracion: 1.5 },
  "corte-color": { nombre: "Corte + Color", duracion: 2},
}

const HORA_INICIO = 9
const HORA_FIN = 21

// ==================== STORAGE MANAGER ====================
const STORAGE_KEY = 'bunker_barber_reservas';

function obtenerReservas() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function guardarReservas(reservas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
  } catch (e) {
    console.error("Error al guardar reservas:", e);
  }
}

function agregarReserva(reserva) {
  const reservas = obtenerReservas();
  reserva.id = Date.now();
  reserva.timestamp = new Date().toISOString();
  reservas.push(reserva);
  guardarReservas(reservas);
  return reserva;
}

function obtenerTurnosOcupados(fecha, barbero) {
  const reservas = obtenerReservas();
  return reservas.filter(r => r.fecha_iso === fecha && r.barbero === barbero);
}

// ==================== MODALES ====================
function mostrarModalCarga() {
  document.getElementById("loadingModal")?.classList.remove("hidden");
}

function ocultarModalCarga() {
  document.getElementById("loadingModal")?.classList.add("hidden");
}

function mostrarModalConfirm(nombre, apellido, servicio, nombreBarbero, fecha, horario, telefono) {
  const confirmDetails = document.getElementById("confirmDetails");
  if (confirmDetails) {
    confirmDetails.innerHTML = `
      <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
      <p><strong>Servicio:</strong> ${servicio}</p>
      <p><strong>Barbero:</strong> ${nombreBarbero}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Horario:</strong> ${horario}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
    `;
  }
  document.getElementById("confirmModal")?.classList.remove("hidden");
}

function cerrarModalConfirm() {
  document.getElementById("confirmModal")?.classList.add("hidden");
}

// ==================== TOAST ====================
function mostrarToast(mensaje, tipo = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  
  toast.textContent = mensaje;
  toast.className = `toast ${tipo}`;
  toast.classList.remove("hidden");
  
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

// ==================== UTILIDADES ====================
function formatFechaDDMMYY(fechaISO) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

function validarFecha(fecha) {
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const max = new Date(hoy);
  max.setDate(hoy.getDate() + 2);
  const fechaObj = new Date(fecha + 'T00:00:00');
  return fechaObj >= hoy && fechaObj <= max;
}

function configurarInputFecha() {
  const inputFecha = document.getElementById("fecha");
  if (!inputFecha) return;
  
  const hoy = new Date();
  const minStr = hoy.toISOString().split("T")[0];
  const max = new Date(hoy);
  max.setDate(hoy.getDate() + 2);
  const maxStr = max.toISOString().split("T")[0];

  inputFecha.min = minStr;
  inputFecha.max = maxStr;
}

// ==================== HORARIOS ====================
function renderizarHorarios() {
  const servicio = document.getElementById("servicio")?.value;
  const fecha = document.getElementById("fecha")?.value;
  const barbero = document.getElementById("barbero")?.value;
  const contenedor = document.getElementById("horariosContainer");
  
  if (!contenedor) return;

  // Validar campos requeridos
  if (!servicio || !fecha) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un servicio y fecha primero</p>';
    return;
  }

  if (!barbero) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un barbero primero</p>';
    return;
  }

  if (!validarFecha(fecha)) {
    contenedor.innerHTML = '<p class="error-text">Fecha no válida. Solo puedes reservar desde hoy hasta 2 días después.</p>';
    return;
  }

  // Obtener turnos ocupados desde localStorage
  const turnosOcupados = obtenerTurnosOcupados(fecha, barbero);
  const duracionServicio = SERVICIOS[servicio].duracion;
  const duracionMinutos = Math.round(duracionServicio * 60);

  // Generar todos los horarios posibles
  const horarios = [];
  for (let h = HORA_INICIO; h < HORA_FIN; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaInicio = h * 60 + m;
      const horaFin = horaInicio + duracionMinutos;
      
      if (horaFin <= HORA_FIN * 60) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        horarios.push(`${hh}:${mm}`);
      }
    }
  }

  // Filtrar horarios ocupados
  const horariosDisponibles = horarios.filter(horario => {
    const [h, m] = horario.split(':').map(Number);
    const inicioMinutos = h * 60 + m;
    const finMinutos = inicioMinutos + duracionMinutos;

    for (const turno of turnosOcupados) {
      const [th, tm] = turno.hora.split(':').map(Number);
      const turnoInicio = th * 60 + tm;
      const turnoFin = turnoInicio + (turno.duracionMinutos || 60);

      // Verificar solapamiento
      if (inicioMinutos < turnoFin && turnoInicio < finMinutos) {
        return false;
      }
    }
    return true;
  });

  if (horariosDisponibles.length === 0) {
    contenedor.innerHTML = '<p class="error-text">No hay horarios disponibles para esta fecha y barbero</p>';
    return;
  }

  // Renderizar botones de horarios
  contenedor.innerHTML = horariosDisponibles
    .map(h => `<button type="button" class="horario-btn" data-horario="${h}">${h}</button>`)
    .join('');

  // Agregar event listeners a los botones
  contenedor.querySelectorAll(".horario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      contenedor.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      contenedor.dataset.horariosSeleccionados = btn.dataset.horario;
      actualizarResumen();
      document.querySelector(".btn-submit").disabled = false;
    });
  });
}

// ==================== RESUMEN ====================
function actualizarResumen() {
  const nombre = document.getElementById("nombre")?.value;
  const servicio = document.getElementById("servicio")?.value;
  const fecha = document.getElementById("fecha")?.value;
  const barbero = document.getElementById("barbero")?.value;
  const horario = document.getElementById("horariosContainer")?.dataset.horariosSeleccionados;
  const resumen = document.getElementById("resumenReserva");
  
  if (!resumen) return;

  if (!nombre || !servicio || !fecha || !barbero || !horario) {
    resumen.classList.remove("visible");
    return;
  }

  const servicioNombre = SERVICIOS[servicio]?.nombre || servicio;
  const barberoNombre = barbero.charAt(0).toUpperCase() + barbero.slice(1);
  const fechaFormateada = formatFechaDDMMYY(fecha);

  resumen.innerHTML = `
    <h3>Resumen de tu Reserva</h3>
    <p><strong>Cliente:</strong> ${nombre}</p>
    <p><strong>Servicio:</strong> ${servicioNombre}</p>
    <p><strong>Barbero:</strong> ${barberoNombre}</p>
    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
    <p><strong>Horario:</strong> ${horario}</p>
  `;
  resumen.classList.add("visible");
}

// ==================== EVENT LISTENERS ====================
function inicializarEventListeners() {
  const servicioSelect = document.getElementById("servicio");
  const fechaInput = document.getElementById("fecha");
  const barberoInput = document.getElementById("barbero");
  const nombreInput = document.getElementById("nombre");
  const bookingForm = document.getElementById("bookingForm");

  // Botones de barbero
  const barberoButtons = document.querySelectorAll(".barbero-btn");
  barberoButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      barberoButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const barberoValue = btn.getAttribute("data-barbero");
      if (barberoInput) {
        barberoInput.value = barberoValue;
        renderizarHorarios();
        actualizarResumen();
      }
    });
  });

  // Cambios en servicio, fecha
  if (servicioSelect) {
    servicioSelect.addEventListener("change", () => {
      renderizarHorarios();
      actualizarResumen();
    });
  }

  if (fechaInput) {
    fechaInput.addEventListener("change", () => {
      renderizarHorarios();
      actualizarResumen();
    });
  }

  if (nombreInput) {
    nombreInput.addEventListener("input", actualizarResumen);
  }

  // Submit del formulario
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const apellido = document.getElementById("apellido").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const barbero = document.getElementById("barbero").value;
      const servicio = document.getElementById("servicio").value;
      const fecha = document.getElementById("fecha").value;
      const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados;
      const pago = document.getElementById("pago").value;

      // Validar campos
      if (!nombre || !apellido || !telefono || !barbero || !servicio || !fecha || !horario || !pago) {
        mostrarToast("Por favor completa todos los campos", "error");
        return;
      }

      mostrarModalCarga();

      const nombreBarbero = barbero.charAt(0).toUpperCase() + barbero.slice(1);
      const durMinutos = Math.round(SERVICIOS[servicio].duracion * 60);
      const fechaDDMMYY = formatFechaDDMMYY(fecha);

      const reserva = {
        nombre,
        apellido,
        telefono,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: durMinutos,
        fecha: fechaDDMMYY,
        fecha_iso: fecha,
        hora: horario,
        pago,
      };

      // Guardar en localStorage
      agregarReserva(reserva);

      // Mostrar confirmación
      setTimeout(() => {
        ocultarModalCarga();
        mostrarModalConfirm(nombre, apellido, SERVICIOS[servicio].nombre, nombreBarbero, fechaDDMMYY, horario, telefono);
      }, 800);

      // Resetear formulario
      bookingForm.reset();
      document.getElementById("horariosContainer").innerHTML = '<p class="placeholder-text">Selecciona servicio, fecha y barbero</p>';
      document.getElementById("horariosContainer").dataset.horariosSeleccionados = "";
      document.getElementById("resumenReserva").classList.remove("visible");
      document.querySelector(".btn-submit").disabled = true;
      barberoButtons.forEach(b => b.classList.remove("active"));
    });
  }

  // Carrusel
  const carouselItems = document.getElementById("carouselItems");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  
  if (carouselItems && prevBtn && nextBtn) {
    let currentIndex = 0;
    const itemWidth = 300;

    function updateCarousel() {
      carouselItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    nextBtn.addEventListener("click", () => {
      const maxIndex = carouselItems.children.length - 1;
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
  }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", () => {
  console.log('%c💈 BUNKER Barber Studio - Live Version', 'font-size: 18px; font-weight: bold; color: #b8860b;');
  console.log('%c✨ Funciona 100% sin backend - Datos en localStorage', 'font-size: 12px; color: #16302b;');
  
  configurarInputFecha();
  
  const btnSubmit = document.querySelector(".btn-submit");
  if (btnSubmit) {
    btnSubmit.disabled = true;
  }
  
  inicializarEventListeners();
});
