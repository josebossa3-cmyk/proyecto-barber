// Sistema de Gestión de Turnos - Bunker Barber

const SERVICIOS = {
  corte: { nombre: "Corte", duracion: 0.5 },
  "corte-barba": { nombre: "Corte + Barba", duracion: 1.5 },
  "corte-color": { nombre: "Corte + Color", duracion: 2 },
}

const HORA_INICIO = 9
const HORA_FIN = 21

const WEB_APP_URL = "/api/turnos"
const CONSULTAR_TURNOS_URL = "/api/turnos/disponibilidad"

let confirmModalInstance = null

function parseHora(horaStr) {
  if (!horaStr) return [0, 0]
  const parts = String(horaStr).split(":")
  return [parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0]
}

function mostrarModalCarga() {
  const modal = document.getElementById("loadingModal")
  if (!modal) return
  modal.classList.remove("d-none")
  modal.classList.add("d-flex")
}

function ocultarModalCarga() {
  const modal = document.getElementById("loadingModal")
  if (!modal) return
  modal.classList.add("d-none")
  modal.classList.remove("d-flex")
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
  const el = document.getElementById("confirmModal")
  if (!el || typeof bootstrap === "undefined") return
  if (!confirmModalInstance) {
    confirmModalInstance = new bootstrap.Modal(el)
  }
  confirmModalInstance.show()
}

function mostrarToast(mensaje, tipo = "info") {
  const toast = document.getElementById("toast")
  if (!toast) return

  toast.textContent = mensaje
  toast.className = `toast toast-${tipo}`
  toast.classList.remove("hidden")

  clearTimeout(mostrarToast._timer)
  mostrarToast._timer = setTimeout(() => toast.classList.add("hidden"), 4000)
}

function formatFechaDDMMYY(fechaISO) {
  const [y, m, d] = fechaISO.split("-")
  return `${d}/${m}/${y.slice(2)}`
}

function validarFecha(fecha) {
  if (!fecha) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const max = new Date(hoy)
  max.setDate(hoy.getDate() + 2)
  const fechaObj = new Date(fecha + "T00:00:00")
  return fechaObj >= hoy && fechaObj <= max
}

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

function generarHorarios(duracionMinutos) {
  const horarios = []
  for (let h = HORA_INICIO; h < HORA_FIN; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaInicio = h * 60 + m
      const horaFin = horaInicio + duracionMinutos
      if (horaFin <= HORA_FIN * 60) {
        horarios.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
      }
    }
  }
  return horarios
}

function horarioDisponible(horario, duracionMinutos, turnosOcupados) {
  const [h, m] = parseHora(horario)
  const inicioMinutos = h * 60 + m
  const finMinutos = inicioMinutos + duracionMinutos

  for (const turno of turnosOcupados) {
    const [th, tm] = parseHora(turno.hora)
    const turnoInicio = th * 60 + tm
    const turnoFin = turnoInicio + (turno.duracionMinutos || 60)
    if (inicioMinutos < turnoFin && turnoInicio < finMinutos) return false
  }
  return true
}

async function renderizarHorarios() {
  const servicio = document.getElementById("servicio")?.value
  const fecha = document.getElementById("fecha")?.value
  const barbero = document.getElementById("barbero")?.value
  const contenedor = document.getElementById("horariosContainer")

  if (!contenedor) return

  if (!servicio || !fecha) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un servicio y fecha primero</p>'
    return
  }

  if (!barbero) {
    contenedor.innerHTML = '<p class="placeholder-text">Selecciona un barbero primero</p>'
    return
  }

  if (!SERVICIOS[servicio]) {
    contenedor.innerHTML = '<p class="error-text">Servicio no válido</p>'
    return
  }

  if (!validarFecha(fecha)) {
    contenedor.innerHTML = '<p class="error-text">Fecha no válida. Solo puedes reservar desde hoy hasta 2 días después.</p>'
    return
  }

  contenedor.innerHTML = '<div class="horarios-loading"><div class="spinner-border spinner-border-sm text-warning" role="status"></div> Cargando horarios...</div>'

  try {
    const response = await fetch(`${CONSULTAR_TURNOS_URL}?fecha=${encodeURIComponent(fecha)}&barbero=${encodeURIComponent(barbero)}`)
    const data = await response.json()

    if (!data.success) {
      contenedor.innerHTML = '<p class="error-text">Error al cargar horarios</p>'
      return
    }

    const turnosOcupados = data.data || []
    const duracionMinutos = Math.round(SERVICIOS[servicio].duracion * 60)
    const horariosDisponibles = generarHorarios(duracionMinutos).filter((h) =>
      horarioDisponible(h, duracionMinutos, turnosOcupados)
    )

    if (horariosDisponibles.length === 0) {
      contenedor.innerHTML = '<p class="error-text">No hay horarios disponibles para esta fecha y barbero</p>'
      return
    }

    contenedor.innerHTML = horariosDisponibles
      .map((h) => `<button type="button" class="horario-btn" data-horario="${h}">${h}</button>`)
      .join("")

    contenedor.querySelectorAll(".horario-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        contenedor.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"))
        btn.classList.add("selected")
        contenedor.dataset.horariosSeleccionados = btn.dataset.horario
        document.getElementById("hora").value = btn.dataset.horario
        document.getElementById("duracionMinutos").value = duracionMinutos
        actualizarResumen()
        const submitBtn = document.querySelector(".btn-submit")
        if (submitBtn) submitBtn.disabled = false
      })
    })
  } catch (error) {
    console.error("Error al renderizar horarios:", error)
    contenedor.innerHTML =
      '<p class="error-text server-error"><strong>No se pudo conectar al servidor.</strong><br>Ejecuta <code>start_server.bat</code> y accede desde <code>http://localhost:3000</code>.</p>'
  }
}

function actualizarResumen() {
  const nombre = document.getElementById("nombre")?.value
  const apellido = document.getElementById("apellido")?.value
  const servicio = document.getElementById("servicio")?.value
  const fecha = document.getElementById("fecha")?.value
  const barbero = document.getElementById("barbero")?.value
  const horario = document.getElementById("horariosContainer")?.dataset.horariosSeleccionados
  const resumen = document.getElementById("resumenReserva")

  if (!resumen) return

  if (!nombre || !servicio || !fecha || !barbero || !horario) {
    resumen.classList.add("d-none")
    resumen.classList.remove("visible")
    return
  }

  const servicioNombre = SERVICIOS[servicio]?.nombre || servicio
  const barberoNombre = barbero.charAt(0).toUpperCase() + barbero.slice(1)
  const cliente = apellido ? `${nombre} ${apellido}` : nombre

  resumen.innerHTML = `
    <h3>Resumen de tu reserva</h3>
    <p><strong>Cliente:</strong> ${cliente}</p>
    <p><strong>Servicio:</strong> ${servicioNombre}</p>
    <p><strong>Barbero:</strong> ${barberoNombre}</p>
    <p><strong>Fecha:</strong> ${formatFechaDDMMYY(fecha)}</p>
    <p><strong>Horario:</strong> ${horario}</p>
  `
  resumen.classList.remove("d-none")
  resumen.classList.add("visible")
}

async function enviarReserva(turnoData) {
  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(turnoData),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Error al registrar la reserva")
  }
  return data.success === true
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle")
  const nav = document.getElementById("navPrimary")
  if (!toggle || !nav) return

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active")
    toggle.setAttribute("aria-expanded", nav.classList.contains("active"))
  })

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("active"))
  })
}

function initCarousel() {
  const carouselElement = document.getElementById("cortesCarousel")
  if (!carouselElement || typeof bootstrap === "undefined") return

  new bootstrap.Carousel(carouselElement, {
    interval: 4000,
    ride: "carousel",
    pause: "hover",
    touch: true,
    wrap: true,
  })
}

function inicializarEventListeners() {
  const servicioSelect = document.getElementById("servicio")
  const fechaInput = document.getElementById("fecha")
  const barberoInput = document.getElementById("barbero")
  const nombreInput = document.getElementById("nombre")
  const apellidoInput = document.getElementById("apellido")
  const bookingForm = document.getElementById("bookingForm")
  const barberoButtons = document.querySelectorAll(".barbero-btn")

  barberoButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      barberoButtons.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      if (barberoInput) {
        barberoInput.value = btn.dataset.barbero
        renderizarHorarios()
        actualizarResumen()
      }
    })
  })

  servicioSelect?.addEventListener("change", () => {
    renderizarHorarios()
    actualizarResumen()
  })

  fechaInput?.addEventListener("change", () => {
    renderizarHorarios()
    actualizarResumen()
  })

  nombreInput?.addEventListener("input", actualizarResumen)
  apellidoInput?.addEventListener("input", actualizarResumen)

  bookingForm?.addEventListener("submit", async (e) => {
    e.preventDefault()

    const nombre = document.getElementById("nombre").value.trim()
    const apellido = document.getElementById("apellido").value.trim()
    const telefono = document.getElementById("telefono").value.trim()
    const barbero = document.getElementById("barbero").value
    const servicio = document.getElementById("servicio").value
    const fecha = document.getElementById("fecha").value
    const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados
    const pago = document.getElementById("pago").value

    if (!nombre || !apellido || !telefono || !barbero || !servicio || !fecha || !horario || !pago) {
      mostrarToast("Por favor completa todos los campos", "error")
      return
    }

    if (telefono.replace(/\D/g, "").length < 7) {
      mostrarToast("El teléfono debe tener al menos 7 dígitos", "error")
      return
    }

    if (!SERVICIOS[servicio]) {
      mostrarToast("Selecciona un servicio válido", "error")
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
      servicio: SERVICIOS[servicio].nombre,
      duracionMinutos: durMinutos,
      fecha,
      hora: horario,
      pago,
    }

    try {
      const enviado = await enviarReserva(turnoData)
      if (!enviado) throw new Error("No se pudo registrar la reserva")

      ocultarModalCarga()
      mostrarModalConfirm(nombre, apellido, SERVICIOS[servicio].nombre, nombreBarbero, fechaDDMMYY, horario, telefono)
      mostrarToast("¡Reserva confirmada!", "success")

      bookingForm.reset()
      document.getElementById("horariosContainer").innerHTML =
        '<p class="placeholder-text">Selecciona servicio, fecha y barbero</p>'
      document.getElementById("horariosContainer").dataset.horariosSeleccionados = ""
      document.getElementById("hora").value = ""
      document.getElementById("duracionMinutos").value = ""
      document.getElementById("resumenReserva").classList.add("d-none")
      document.getElementById("resumenReserva").classList.remove("visible")
      document.querySelector(".btn-submit").disabled = true
      barberoButtons.forEach((b) => b.classList.remove("active"))
      configurarInputFecha()
    } catch (error) {
      ocultarModalCarga()
      mostrarToast(error.message || "Error al registrar la reserva", "error")
    }
  })

  initCarousel()
  initMobileNav()
}

document.addEventListener("DOMContentLoaded", () => {
  configurarInputFecha()

  const btnSubmit = document.querySelector(".btn-submit")
  if (btnSubmit) btnSubmit.disabled = true

  inicializarEventListeners()
})
