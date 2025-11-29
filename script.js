

// Sistema de Gestión de Turnos - Bunker Barber

// Configuración de servicios y duración (en horas exactas)
const SERVICIOS = {
  corte: { nombre: "Corte", duracion: 0.5 },
  "corte-barba": { nombre: "Corte + Barba", duracion: 1.5 },
  "corte-color": { nombre: "Corte + Color", duracion: 2},
}

// Horarios disponibles (en formato 24h)
const HORA_INICIO = 9
const HORA_FIN = 21

// Ahora utilizamos nuestro backend PHP + MySQL en /api/
const WEB_APP_URL = '/api/book.php'

// Funciones para manejar modales
function mostrarModalCarga() {
  document.getElementById("loadingModal").classList.remove("hidden")
}

function ocultarModalCarga() {
  document.getElementById("loadingModal").classList.add("hidden")
}

function mostrarModalConfirm(nombre, apellido, servicio, nombreBarbero, fecha, horario, email) {
  const confirmDetails = document.getElementById("confirmDetails")
  confirmDetails.innerHTML = `
    <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
    <p><strong>Servicio:</strong> ${servicio}</p>
    <p><strong>Barbero:</strong> ${nombreBarbero}</p>
    <p><strong>Fecha:</strong> ${fecha}</p>
    <p><strong>Horario:</strong> ${horario}</p>
    <p><strong>Email:</strong> ${email}</p>
  `
  document.getElementById("confirmModal").classList.remove("hidden")
}

function cerrarModalConfirm() {
  document.getElementById("confirmModal").classList.add("hidden")
}
// Obtener todas las reservas del localStorage
function obtenerReservas() {
  const reservas = localStorage.getItem("bunkerBarberReservas")
  return reservas ? JSON.parse(reservas) : {}
}

// Guardar reservas en localStorage
function guardarReservas(reservas) {
  localStorage.setItem("bunkerBarberReservas", JSON.stringify(reservas))
}


// Generar horarios disponibles basados en la duración del servicio
function generarHorarios(duracion) {
  const horarios = []

  // duración en minutos
  const duracionMinutos = Math.round(duracion * 60)
  const inicioMin = HORA_INICIO * 60
  const finMin = HORA_FIN * 60

  // generar slots cada 30 minutos asegurando que el servicio termine antes de HORA_FIN
  for (let t = inicioMin; t + duracionMinutos <= finMin; t += 30) {
    const hh = Math.floor(t / 60)
    const mm = t % 60
    horarios.push(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`)
  }

  return horarios
}

// Toast (mensajes breves)
function mostrarToast(mensaje, tipo = "info", duracion = 3500) {
  const toast = document.getElementById("toast")
  if (!toast) return
  toast.textContent = mensaje
  toast.className = `toast ${tipo}`
  toast.classList.remove("hidden")
  if (duracion > 0) {
    setTimeout(() => {
      toast.classList.add("hidden")
    }, duracion)
  }
}

// Formatea fecha ISO (YYYY-MM-DD) a dd-mm-yy (ej: 25-11-25)
function formatFechaDDMMYY(isoFecha) {
  if (!isoFecha) return ""
  // crear Date con timezone local para evitar desajustes
  const parts = isoFecha.split("-")
  if (parts.length < 3) return isoFecha
  const yyyy = parts[0]
  const mm = parts[1]
  const dd = parts[2]
  const yy = yyyy.slice(-2)
  return `${dd}-${mm}-${yy}`
}

// Obtener el rango de 3 días permitidos
function obtenerFechasPermitidas() {
  const hoy = new Date()
  const fechas = []

  for (let i = 0; i < 3; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    fechas.push(fecha.toISOString().split("T")[0])
  }

  return fechas
}

// Validar fecha
function validarFecha(fecha) {
  const fechasPermitidas = obtenerFechasPermitidas()
  return fechasPermitidas.includes(fecha)
}

// Obtener el nombre del día
function obtenerNombreDia(fecha) {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const d = new Date(fecha + "T00:00:00")
  return dias[d.getDay()]
}

// Configurar el input de fecha con restricción de 3 días
function configurarInputFecha() {
  const inputFecha = document.getElementById("fecha")
  const hoy = new Date().toISOString().split("T")[0]
  const maxFecha = new Date()
  maxFecha.setDate(maxFecha.getDate() + 2)
  const maxFechaStr = maxFecha.toISOString().split("T")[0]

  inputFecha.min = hoy
  inputFecha.max = maxFechaStr
}

// Renderizar horarios disponibles
function renderizarHorarios() {
  const servicio = document.getElementById("servicio").value
  const fecha = document.getElementById("fecha").value
  const barbero = document.getElementById("barbero").value
  const contenedor = document.getElementById("horariosContainer")

  if (!servicio || !fecha) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un servicio y fecha primero</p>'
    return
  }

  if (!barbero) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un barbero primero</p>'
    return
  }

  if (!validarFecha(fecha)) {
    contenedor.innerHTML = '<p class="placeholder-text">Fecha no disponible. Máximo 3 días desde hoy.</p>'
    return
  }

  const duracion = SERVICIOS[servicio].duracion
  const horarios = generarHorarios(duracion)
  const reservas = obtenerReservas()
  const reservasDelDia = reservas[fecha] || {}

  // Preparar intervalos ocupados para este barbero
  const reservasIntervalos = []
  const servicioNamesToKey = {}
  for (const key in SERVICIOS) {
    servicioNamesToKey[SERVICIOS[key].nombre] = key
  }

  Object.keys(reservasDelDia).forEach((startStr) => {
    const reserva = reservasDelDia[startStr]
    // Solo considerar reservas del mismo barbero
    if (reserva && reserva.barbero === barbero) {
      const [hh, mm] = startStr.split(":").map(Number)
      const startMin = hh * 60 + mm
      let durMin = null
      if (reserva && reserva.duracionMinutos) {
        durMin = reserva.duracionMinutos
      } else if (reserva && reserva.servicio) {
        const key = servicioNamesToKey[reserva.servicio]
        durMin = key ? Math.round(SERVICIOS[key].duracion * 60) : 60
      } else {
        durMin = 60
      }
      reservasIntervalos.push({ start: startMin, end: startMin + durMin })
    }
  })

  contenedor.innerHTML = ""

  horarios.forEach((horario) => {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "horario-btn"
    btn.textContent = horario

    // Comprobar solapamiento con reservas existentes del mismo barbero
    const [hC, mC] = horario.split(":").map(Number)
    const candidatoStart = hC * 60 + mC
    const duracionMinutos = Math.round(duracion * 60)
    const candidatoEnd = candidatoStart + duracionMinutos

    const solapa = reservasIntervalos.some((r) => candidatoStart < r.end && r.start < candidatoEnd)

    if (solapa) {
      btn.disabled = true
      btn.title = "Este barbero no está disponible en este horario"
    } else {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        document.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"))
        btn.classList.add("selected")
        document.getElementById("horariosContainer").dataset.horariosSeleccionados = horario
        actualizarResumen()
      })
    }

    contenedor.appendChild(btn)
  })
}

// Actualizar el resumen de la reserva
function actualizarResumen() {
  const nombre = document.getElementById("nombre").value
  const servicio = document.getElementById("servicio").value
  const fecha = document.getElementById("fecha").value
  const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados || null
  const resumenBox = document.getElementById("resumenReserva")

  if (nombre && servicio && fecha && horario) {
    const nombreServicio = SERVICIOS[servicio].nombre
    const nombreDia = obtenerNombreDia(fecha)
  const duracion = SERVICIOS[servicio].duracion
  // formatear duración en horas y minutos (ej: 1h 30m)
  const horas = Math.floor(duracion)
  const minutos = Math.round((duracion - horas) * 60)
  const duracionTexto = `${horas}${minutos ? `h ${minutos}m` : "h"}`

  resumenBox.innerHTML = `
      <strong style="color: #ffbc0e; font-size: 16px; display: block; margin-bottom: 10px;">📋 Resumen de tu Reserva</strong>
      <div class="resumen-item">
        <span class="resumen-label">Nombre:</span>
        <span>${nombre}</span>
      </div>
      <div class="resumen-item">
        <span class="resumen-label">Servicio:</span>
        <span>${nombreServicio}</span>
      </div>
      <div class="resumen-item">
        <span class="resumen-label">Duración:</span>
        <span>${duracionTexto}</span>
      </div>
      <div class="resumen-item">
        <span class="resumen-label">Fecha:</span>
        <span>${formatFechaDDMMYY(fecha)} (${nombreDia})</span>
      </div>
      <div class="resumen-item">
        <span class="resumen-label">Horario:</span>
        <span>${horario}</span>
      </div>
    `
    resumenBox.classList.add("visible")
    document.querySelector(".btn-submit").disabled = false
  } else {
    resumenBox.classList.remove("visible")
    document.querySelector(".btn-submit").disabled = true
  }
}

// Verificar si un turno puede ser cancelado
// Nota: la funcionalidad de cancelación de turnos fue removida por limpieza.

// Mostrar las reservas confirmadas
function mostrarReservasConfirmadas() {
  const contenedor = document.getElementById("reservasInfo")
  contenedor.innerHTML = `
    <div class="reservas-titulo">
      ✅ Sistema de Reservas Activo
      <p style="color: #a8a8a8; font-size: 14px; margin-top: 8px; font-weight: 400;">
        Las reservas confirmadas se envían directamente a Google Sheets y recibirás confirmación por email.
      </p>
    </div>
  `
}

async function enviarReservaAGoogleSheets(turnoData) {
  try {
    // ahora POST al endpoint PHP que inserta en MySQL
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turnoData)
    })
    const json = await res.json()
    return json.success === true
  } catch(err){
    console.error('[v0] Error al enviar a backend:', err)
    return false
  }
}

// Event Listeners - Se inicializan en DOMContentLoaded
function inicializarEventListeners() {
  const servicioSelect = document.getElementById("servicio")
  const fechaInput = document.getElementById("fecha")
  const barberoSelect = document.getElementById("barbero")
  const nombreInput = document.getElementById("nombre")
  const bookingForm = document.getElementById("bookingForm")
  const carouselItems = document.getElementById("carouselItems")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  if (servicioSelect) {
    servicioSelect.addEventListener("change", () => {
      renderizarHorarios()
      actualizarResumen()
    })
  }

  if (fechaInput) {
    fechaInput.addEventListener("change", () => {
      renderizarHorarios()
      actualizarResumen()
    })
  }

  if (barberoSelect) {
    barberoSelect.addEventListener("change", () => {
      renderizarHorarios()
      actualizarResumen()
    })
  }

  if (nombreInput) {
    nombreInput.addEventListener("input", actualizarResumen)
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const nombre = document.getElementById("nombre").value
      const apellido = document.getElementById("apellido").value
      const email = document.getElementById("email").value
      const barbero = document.getElementById("barbero").value
      const servicio = document.getElementById("servicio").value
      const fecha = document.getElementById("fecha").value
      const fechaIso = fecha
      const fechaDDMMYY = formatFechaDDMMYY(fechaIso)
      const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados
      const pago = document.getElementById("pago").value

      if (!nombre || !apellido || !email || !barbero || !servicio || !fecha || !horario || !pago) {
        mostrarToast("Por favor completa todos los campos", "error")
        return
      }

      mostrarModalCarga()

      const selectBarbero = document.getElementById("barbero")
      const nombreBarbero = selectBarbero.options[selectBarbero.selectedIndex].text

      const turnoData = {
        nombre,
        apellido,
        email,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: Math.round(SERVICIOS[servicio].duracion * 60),
        // Fecha enviada a la DB en formato dd-mm-yy
        fecha: fechaDDMMYY,
        fecha_iso: fechaIso,
        horario,
        pago,
        timestamp: new Date().toISOString(),
      }

      console.log("[v0] Enviando formulario - turnoData:", turnoData)
      const enviado = await enviarReservaAGoogleSheets(turnoData)

      if (!enviado) {
        ocultarModalCarga()
        mostrarToast("Error al registrar la reserva. Por favor intenta nuevamente.", "error")
        return
      }

      const reservas = obtenerReservas()
      if (!reservas[fechaIso]) {
        reservas[fechaIso] = {}
      }

      reservas[fechaIso][horario] = {
        nombre,
        apellido,
        email,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: Math.round(SERVICIOS[servicio].duracion * 60),
        fecha: fechaDDMMYY,
        fecha_iso: fechaIso,
        pago,
        timestamp: turnoData.timestamp,
        enviado: true,
      }

      guardarReservas(reservas)

      // Simular pequeña demora para que se vea la animación
      setTimeout(() => {
        ocultarModalCarga()
        mostrarModalConfirm(nombre, apellido, SERVICIOS[servicio].nombre, nombreBarbero, fechaDDMMYY, horario, email)
      }, 1500)

      document.getElementById("bookingForm").reset()
      document.getElementById("horariosContainer").dataset.horariosSeleccionados = ""
      document.getElementById("resumenReserva").classList.remove("visible")
      document.querySelector(".btn-submit").disabled = true
      document.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"))

      renderizarHorarios()
      mostrarReservasConfirmadas()
    })
  }

  // Carrusel
  let currentIndex = 0

  function updateCarousel() {
    if (!carouselItems) return
    const itemWidth = 280 + 20
    carouselItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1)
      updateCarousel()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!carouselItems) return
      const maxIndex = carouselItems.children.length - 3
      currentIndex = Math.min(maxIndex, currentIndex + 1)
      updateCarousel()
    })
  }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("[DEBUG] DOM cargado, inicializando...")
  
  configurarInputFecha()
  mostrarReservasConfirmadas()
  
  const btnSubmit = document.querySelector(".btn-submit")
  if (btnSubmit) {
    btnSubmit.disabled = true
  }
  
  // Inicializar event listeners
  inicializarEventListeners()
  
  // Inicializar toggler del menú hamburguesa
  const navToggle = document.getElementById("navToggle")
  const navPrimary = document.getElementById("navPrimary")
  if (navToggle && navPrimary) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true"
      navToggle.setAttribute("aria-expanded", String(!expanded))
      navPrimary.classList.toggle("active")
    })
    // Cerrar menú al hacer click en un link
    const navLinks = navPrimary.querySelectorAll(".nav-links a")
    navLinks.forEach((a) =>
      a.addEventListener("click", () => {
        navPrimary.classList.remove("active")
        navToggle.setAttribute("aria-expanded", "false")
      }),
    )
  }
  
  console.log("[DEBUG] Inicialización completada")
})