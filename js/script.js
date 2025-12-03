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

// Endpoint backend para procesar reservas (alineado con el form HTML)
// Detectar si estamos en admin o en raíz
const WEB_APP_URL = window.location.pathname.includes('/admin/') ? '../procesar_reserva.php' : 'procesar_reserva.php'
const CONSULTAR_TURNOS_URL = window.location.pathname.includes('/admin/') ? '../consultar_turnos.php' : 'consultar_turnos.php'

// Funciones para manejar modales
function mostrarModalCarga() {
  document.getElementById("loadingModal").classList.remove("hidden")
}

function ocultarModalCarga() {
  document.getElementById("loadingModal").classList.add("hidden")
}

function mostrarModalConfirm(nombre, apellido, servicio, nombreBarbero, fecha, horario, telefono) {
  const confirmDetails = document.getElementById("confirmDetails")
  confirmDetails.innerHTML = `
    <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
    <p><strong>Servicio:</strong> ${servicio}</p>
    <p><strong>Barbero:</strong> ${nombreBarbero}</p>
    <p><strong>Fecha:</strong> ${fecha}</p>
    <p><strong>Horario:</strong> ${horario}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
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

// Obtener el nombre del día
function obtenerNombreDia(fecha) {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const d = new Date(fecha + "T00:00:00")
  return dias[d.getDay()]
}

// Configurar el input de fecha: desde hoy hasta 2 días después
function configurarInputFecha() {
  const inputFecha = document.getElementById("fecha")
  const hoy = new Date()
  const minStr = hoy.toISOString().split("T")[0]
  const max = new Date(hoy)
  max.setDate(hoy.getDate() + 2)
  const maxStr = max.toISOString().split("T")[0]

  inputFecha.min = minStr
  inputFecha.max = maxStr
}

// Renderizar horarios disponibles (ahora consulta al servidor para turnos reales)
async function renderizarHorarios() {
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
    contenedor.innerHTML = '<p class="placeholder-text">Fecha no disponible. Solo puedes reservar desde hoy hasta 2 días después.</p>'
    return
  }

  const duracion = SERVICIOS[servicio].duracion
  const horarios = generarHorarios(duracion)
  const reservas = obtenerReservas()
  const reservasDelDia = reservas[fecha] || {}

  // Preparar intervalos ocupados para este barbero (combinando servidor + localStorage)
  const reservasIntervalos = []
  const servicioNamesToKey = {}
  for (const key in SERVICIOS) {
    servicioNamesToKey[SERVICIOS[key].nombre] = key
  }

  // 1) Consultar turnos reales al servidor
  let serverChecked = false
  try {
    const url = `${CONSULTAR_TURNOS_URL}?fecha_iso=${encodeURIComponent(fecha)}&barbero=${encodeURIComponent(barbero)}`
    const resp = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
    if (resp.ok) {
      const json = await resp.json()
      if (json && json.success && Array.isArray(json.turnos)) {
        serverChecked = true
        // Sincronizar localStorage con la respuesta del servidor para evitar
        // que datos obsoletos en el navegador sigan bloqueando horarios.
        try {
          const reservas = obtenerReservas()
          // Inicializar estructura para la fecha
          reservas[fecha] = reservas[fecha] || {}

          // Si el servidor dice que no hay turnos, limpiar la fecha local
          if (json.turnos.length === 0) {
            if (reservas[fecha]) {
              delete reservas[fecha]
            }
          } else {
            // Mapear cada turno del servidor a la estructura local
            json.turnos.forEach(t => {
              const horaStr = (t.hora || '').substr(0,5)
              const dur = Number.isFinite(t.duracionMinutos) && t.duracionMinutos > 0 ? parseInt(t.duracionMinutos, 10) : 60
              // Encontrar servicio por duración (mejor aproximación)
              let servicioName = ''
              for (const k in SERVICIOS) {
                if (Math.round(SERVICIOS[k].duracion * 60) === dur) {
                  servicioName = SERVICIOS[k].nombre
                  break
                }
              }
              if (!servicioName) servicioName = 'Servicio'

              reservas[fecha][horaStr] = {
                nombre: 'Reservado',
                apellido: '',
                telefono: '',
                barbero: barbero,
                nombreBarbero: barbero.charAt(0).toUpperCase() + barbero.slice(1),
                servicio: servicioName,
                duracionMinutos: dur,
                fecha: formatFechaDDMMYY(fecha),
                fecha_iso: fecha,
                pago: '',
                timestamp: new Date().toISOString(),
                enviado: true
              }

              const parts = horaStr.split(":").map(Number)
              const startMin = parts[0] * 60 + parts[1]
              reservasIntervalos.push({ start: startMin, end: startMin + dur })
            })
          }

          guardarReservas(reservas)
        } catch (e) {
          console.warn('[renderizarHorarios] No se pudo sincronizar localStorage con servidor:', e)
          // fallback: si falla la sincronización, aún añadimos los intervalos al array
          json.turnos.forEach(t => {
            const parts = (t.hora || '').split(":").map(Number)
            const startMin = parts[0] * 60 + parts[1]
            const dur = Number.isFinite(t.duracionMinutos) && t.duracionMinutos > 0 ? parseInt(t.duracionMinutos, 10) : 60
            reservasIntervalos.push({ start: startMin, end: startMin + dur })
          })
        }
      } else {
        // servidor respondió pero sin lista válida -> marcar que fue consultado
        serverChecked = true
      }
    }
  } catch (err) {
    console.warn('[renderizarHorarios] Error al consultar turnos al servidor', err)
    // continuar usando solo localStorage si falla la consulta
  }

  // 2) Añadir reservas locales (solo si no hubo respuesta válida del servidor para evitar bloqueos obsoletos)
  if (!serverChecked) {
    Object.keys(reservasDelDia).forEach((startStr) => {
      const reserva = reservasDelDia[startStr]
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
  }

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
        const cont = document.getElementById("horariosContainer")
        cont.dataset.horariosSeleccionados = horario
        // Rellenar input oculto #hora para compatibilidad con envío por formulario
        const horaInput = document.getElementById("hora")
        if (horaInput) horaInput.value = horario
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

async function enviarReserva(turnoData) {
  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turnoData)
    })
    const json = await res.json()
    return json.success === true
  } catch(err){
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

  // Handler para botones de barbero
  const barberoButtons = document.querySelectorAll(".barbero-btn")
  if (barberoButtons.length > 0) {
    barberoButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        // Remover active de todos
        barberoButtons.forEach(b => b.classList.remove("active"))
        // Activar el clickeado
        btn.classList.add("active")
        // Actualizar input hidden
        const barberoValue = btn.getAttribute("data-barbero")
        if (barberoSelect) {
          barberoSelect.value = barberoValue
          // Trigger change event
          const event = new Event("change")
          barberoSelect.dispatchEvent(event)
        }
      })
    })
  }

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
      const telefono = document.getElementById("telefono").value
      const barbero = document.getElementById("barbero").value
      const servicio = document.getElementById("servicio").value
      const fecha = document.getElementById("fecha").value
      const fechaIso = fecha
      const fechaDDMMYY = formatFechaDDMMYY(fechaIso)
      const horario = document.getElementById("horariosContainer").dataset.horariosSeleccionados
      const pago = document.getElementById("pago").value

      if (!nombre || !apellido || !telefono || !barbero || !servicio || !fecha || !horario || !pago) {
        mostrarToast("Por favor completa todos los campos", "error")
        return
      }

      mostrarModalCarga()

      // Obtener nombre del barbero (capitalizado)
      const nombreBarbero = barbero.charAt(0).toUpperCase() + barbero.slice(1)

      const durMinutos = Math.round(SERVICIOS[servicio].duracion * 60)
      // rellenar input oculto de duración para compatibilidad con envío tradicional
      const durInput = document.getElementById('duracionMinutos')
      if (durInput) durInput.value = durMinutos

      const turnoData = {
        nombre,
        apellido,
        telefono,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: durMinutos,
        // Fecha enviada a la DB en formato dd-mm-yy
        fecha: fechaDDMMYY,
        fecha_iso: fechaIso,
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

      const reservas = obtenerReservas()
      if (!reservas[fechaIso]) {
        reservas[fechaIso] = {}
      }

      reservas[fechaIso][horario] = {
        nombre,
        apellido,
        telefono,
        barbero,
        nombreBarbero,
        servicio: SERVICIOS[servicio].nombre,
        duracionMinutos: durMinutos,
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
        mostrarModalConfirm(nombre, apellido, SERVICIOS[servicio].nombre, nombreBarbero, fechaDDMMYY, horario, telefono)
      }, 1500)

      document.getElementById("bookingForm").reset()
      document.getElementById("horariosContainer").dataset.horariosSeleccionados = ""
      document.getElementById("resumenReserva").classList.remove("visible")
      document.querySelector(".btn-submit").disabled = true
      document.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"))

      renderizarHorarios()
    }
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
  configurarInputFecha()
  
  const btnSubmit = document.querySelector(".btn-submit")
  if (btnSubmit) {
    btnSubmit.disabled = true
  }
  
  inicializarEventListeners()
})
