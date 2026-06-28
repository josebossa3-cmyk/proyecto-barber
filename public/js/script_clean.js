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

// Endpoints
const WEB_APP_URL = window.location.pathname.includes('/admin/') ? '../procesar_reserva.php' : 'procesar_reserva.php'
const CONSULTAR_TURNOS_URL = window.location.pathname.includes('/admin/') ? '../consultar_turnos.php' : 'consultar_turnos.php'

// Funciones para manejar modales
function mostrarModalCarga() {
  document.getElementById("loadingModal")?.classList.remove("hidden")
}

function ocultarModalCarga() {
  document.getElementById("loadingModal")?.classList.add("hidden")
}

function mostrarModalConfirm(nombre, apellido, servicio, nombreBarbero, fecha, horario, telefono) {
  const confirmDetails = document.getElementById("confirmDetails")
  if (confirmDetails) {
    confirmDetails.innerHTML = `
      <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
      <p><strong>Servicio:</strong> ${servicio}</p>
      <p><strong>Barbero:</strong> ${nombreBarbero}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Horario:</strong> ${horario}</p>
      <p><strong>Teléfono:</strong> ${telefono}</p>
    `
  }
  document.getElementById("confirmModal")?.classList.remove("hidden")
}

function cerrarModalConfirm() {
  document.getElementById("confirmModal")?.classList.add("hidden")
}

// Toast notifications
function mostrarToast(mensaje, tipo = "info") {
  const toast = document.getElementById("toast")
  if (!toast) return
  
  toast.textContent = mensaje
  toast.className = `toast ${tipo}`
  toast.classList.remove("hidden")
  
  setTimeout(() => {
    toast.classList.add("hidden")
  }, 4000)
}

// Obtener reservas del localStorage
function obtenerReservas() {
  try {
    const reservas = localStorage.getItem("bunkerBarberReservas")
    return reservas ? JSON.parse(reservas) : {}
  } catch {
    return {}
  }
}

// Guardar reservas en localStorage
function guardarReservas(reservas) {
  try {
    localStorage.setItem("bunkerBarberReservas", JSON.stringify(reservas))
  } catch (e) {
    console.error("Error al guardar reservas:", e)
  }
}

// Formatear fecha a DD/MM/YY
function formatFechaDDMMYY(fechaISO) {
  const [y, m, d] = fechaISO.split("-")
  return `${d}/${m}/${y.slice(2)}`
}

// Validar fecha: permite desde hoy hasta 2 días después
function validarFecha(fecha) {
  if (!fecha) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const max = new Date(hoy)
  max.setDate(hoy.getDate() + 2)
  const fechaObj = new Date(fecha + 'T00:00:00')
  return fechaObj >= hoy && fechaObj <= max
}

// Configurar el input de fecha
function configurarInputFecha() {
  const inputFecha = document.getElementById("fecha")
  if (!inputFecha) return
  
  const hoy = new Date()
  const minStr = hoy.toISOString().split("T")[0]
  const max = new Date(hoy)
  max.setDate(hoy.getDate() + 2)
  const maxStr = max.toISOString().split("T")[0]

  inputFecha.min = minStr
  inputFecha.max = maxStr
}

// Renderizar horarios disponibles
async function renderizarHorarios() {
  const servicio = document.getElementById("servicio")?.value
  const fecha = document.getElementById("fecha")?.value
  const barbero = document.getElementById("barbero")?.value
  const contenedor = document.getElementById("horariosContainer")
  
  if (!contenedor) return

  // Validar campos requeridos
  if (!servicio || !fecha) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un servicio y fecha primero</p>'
    return
  }

  if (!barbero) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un barbero primero</p>'
    return
  }

  if (!validarFecha(fecha)) {
    contenedor.innerHTML = '<p class="error-text">Fecha no válida. Solo puedes reservar desde hoy hasta 2 días después.</p>'
    return
  }

  contenedor.innerHTML = '<p class="placeholder-text">Cargando horarios...</p>'

  try {
    // Consultar turnos ocupados del servidor
    const response = await fetch(`${CONSULTAR_TURNOS_URL}?fecha_iso=${fecha}&barbero=${barbero}`)
    const data = await response.json()
    
    if (!data.success) {
      contenedor.innerHTML = '<p class="error-text">Error al cargar horarios</p>'
      return
    }

    const turnosOcupados = data.turnos || []
    const duracionServicio = SERVICIOS[servicio].duracion
    const duracionMinutos = Math.round(duracionServicio * 60)

    // Generar todos los horarios posibles
    const horarios = []
    for (let h = HORA_INICIO; h < HORA_FIN; h++) {
      for (let m = 0; m < 60; m += 30) {
        const horaInicio = h * 60 + m
        const horaFin = horaInicio + duracionMinutos
        
        if (horaFin <= HORA_FIN * 60) {
          const hh = String(h).padStart(2, "0")
          const mm = String(m).padStart(2, "0")
          horarios.push(`${hh}:${mm}`)
        }
      }
    }

    // Filtrar horarios ocupados
    const horariosDisponibles = horarios.filter(horario => {
      const [h, m] = horario.split(':').map(Number)
      const inicioMinutos = h * 60 + m
      const finMinutos = inicioMinutos + duracionMinutos

      for (const turno of turnosOcupados) {
        const [th, tm] = turno.hora.split(':').map(Number)
        const turnoInicio = th * 60 + tm
        const turnoFin = turnoInicio + (turno.duracionMinutos || 60)

        // Verificar solapamiento
        if (inicioMinutos < turnoFin && turnoInicio < finMinutos) {
          return false
        }
      }
      return true
    })

    if (horariosDisponibles.length === 0) {
      contenedor.innerHTML = '<p class="error-text">No hay horarios disponibles para esta fecha y barbero</p>'
      return
    }

    // Renderizar botones de horarios
    contenedor.innerHTML = horariosDisponibles
      .map(h => `<button type="button" class="horario-btn" data-horario="${h}">${h}</button>`)
      .join('')

    // Agregar event listeners a los botones
    contenedor.querySelectorAll(".horario-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        contenedor.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("selected"))
        btn.classList.add("selected")
        contenedor.dataset.horariosSeleccionados = btn.dataset.horario
        actualizarResumen()
        document.querySelector(".btn-submit").disabled = false
      })
    })

  } catch (error) {
    console.error("Error al renderizar horarios:", error)
    contenedor.innerHTML = '<p class="error-text">Error al cargar horarios disponibles</p>'
  }
}

// Actualizar resumen de la reserva
function actualizarResumen() {
  const nombre = document.getElementById("nombre")?.value
  const servicio = document.getElementById("servicio")?.value
  const fecha = document.getElementById("fecha")?.value
  const barbero = document.getElementById("barbero")?.value
  const horario = document.getElementById("horariosContainer")?.dataset.horariosSeleccionados
  const resumen = document.getElementById("resumenReserva")
  
  if (!resumen) return

  if (!nombre || !servicio || !fecha || !barbero || !horario) {
    resumen.classList.remove("visible")
    return
  }

  const servicioNombre = SERVICIOS[servicio]?.nombre || servicio
  const barberoNombre = barbero.charAt(0).toUpperCase() + barbero.slice(1)
  const fechaFormateada = formatFechaDDMMYY(fecha)

  resumen.innerHTML = `
    <h3>Resumen de tu Reserva</h3>
    <p><strong>Cliente:</strong> ${nombre}</p>
    <p><strong>Servicio:</strong> ${servicioNombre}</p>
    <p><strong>Barbero:</strong> ${barberoNombre}</p>
    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
    <p><strong>Horario:</strong> ${horario}</p>
  `
  resumen.classList.add("visible")
}

// Enviar reserva al servidor
async function enviarReserva(turnoData) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turnoData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error("Error del servidor:", error)
      if (error.error) {
        mostrarToast(error.error, "error")
      }
      return false
    }
    
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Error al enviar reserva:", error)
    return false
  }
}

// Inicializar event listeners
function inicializarEventListeners() {
  const servicioSelect = document.getElementById("servicio")
  const fechaInput = document.getElementById("fecha")
  const barberoInput = document.getElementById("barbero")
  const nombreInput = document.getElementById("nombre")
  const bookingForm = document.getElementById("bookingForm")

  // Botones de barbero
  const barberoButtons = document.querySelectorAll(".barbero-btn")
  barberoButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      barberoButtons.forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      
      const barberoValue = btn.getAttribute("data-barbero")
      if (barberoInput) {
        barberoInput.value = barberoValue
        renderizarHorarios()
        actualizarResumen()
      }
    })
  })

  // Cambios en servicio, fecha
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

  if (nombreInput) {
    nombreInput.addEventListener("input", actualizarResumen)
  }

  // Submit del formulario
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const nombre = document.getElementById("nombre").value.trim()
      const apellido = document.getElementById("apellido").value.trim()
      const telefono = document.getElementById("telefono").value.trim()
      const barbero = document.getElementById("barbero").value
      const servicio = document.getElementById("servicio").value
      const fecha = document.getElementById("fecha").value
      const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados
      const pago = document.getElementById("pago").value

      // Validar campos
      if (!nombre || !apellido || !telefono || !barbero || !servicio || !fecha || !horario || !pago) {
        mostrarToast("Por favor completa todos los campos", "error")
        return
      }

      mostrarModalCarga()

      const nombreBarbero = barbero.charAt(0).toUpperCase() + barbero.slice(1)
      const durMinutos = Math.round(SERVICIOS[servicio].duracion * 60)
      const fechaDDMMYY = formatFechaDDMMYY(fecha)

      const turnoData = {
        nombre,
        apellido,
        telefono,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: durMinutos,
        fecha: fechaDDMMYY,
        fecha_iso: fecha,
        horario,
        pago,
        timestamp: new Date().toISOString(),
      }

      const enviado = await enviarReserva(turnoData)

      if (!enviado) {
        ocultarModalCarga()
        mostrarToast("Error al registrar la reserva. Por favor intenta nuevamente.", "error")
        return
      }

      // Guardar en localStorage
      const reservas = obtenerReservas()
      if (!reservas[fecha]) {
        reservas[fecha] = {}
      }
      reservas[fecha][horario] = {
        nombre,
        apellido,
        telefono,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: durMinutos,
        fecha: fechaDDMMYY,
        fecha_iso: fecha,
        pago,
        timestamp: turnoData.timestamp,
        enviado: true,
      }
      guardarReservas(reservas)

      // Mostrar confirmación
      setTimeout(() => {
        ocultarModalCarga()
        mostrarModalConfirm(nombre, apellido, SERVICIOS[servicio].nombre, nombreBarbero, fechaDDMMYY, horario, telefono)
      }, 800)

      // Resetear formulario
      bookingForm.reset()
      document.getElementById("horariosContainer").innerHTML = '<p class="placeholder-text">Selecciona servicio, fecha y barbero</p>'
      document.getElementById("horariosContainer").dataset.horariosSeleccionados = ""
      document.getElementById("resumenReserva").classList.remove("visible")
      document.querySelector(".btn-submit").disabled = true
      barberoButtons.forEach(b => b.classList.remove("active"))
    })
  }

  // Carrusel
  const carouselItems = document.getElementById("carouselItems")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")
  
  if (carouselItems && prevBtn && nextBtn) {
    let currentIndex = 0
    const itemWidth = 300

    function updateCarousel() {
      carouselItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`
    }

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--
        updateCarousel()
      }
    })

    nextBtn.addEventListener("click", () => {
      const maxIndex = carouselItems.children.length - 1
      if (currentIndex < maxIndex) {
        currentIndex++
        updateCarousel()
      }
    })
  }
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  configurarInputFecha()
  
  const btnSubmit = document.querySelector(".btn-submit")
  if (btnSubmit) {
    btnSubmit.disabled = true
  }
  
  inicializarEventListeners()
})
