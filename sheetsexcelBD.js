// aca sacanis el link de el excel y el nombre de la tabla que esta en uso 
let turnos = []
const SPREADSHEET_ID = "1HFmLcsYydCs4ur7kTqIFitr3dTzGxFDWYfo0673OZf4"
const SHEET_NAME = "turnos"
let gapi

async function getTurnos() {
    if (!window.googleAuthComplete) {
        console.warn("[v0] Esperando autenticación...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    let response
    try {
        console.log("[v0] Obteniendo turnos de Google Sheets...")
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:I`,
        })
    } catch (err) {
        console.error("[v0] Error al obtener turnos:", err)
        return
    }

    const range = response.result
    if (!range || !range.values || range.values.length === 0) {
        console.warn("[v0] No se encontraron valores en Google Sheets")
        return
    }

    turnos = []
    range.values.forEach((fila) => {
        if (!fila[0] || isNaN(Number.parseInt(fila[0], 10))) return

        const nuevoturno = {
            id: fila[0],
            cliente: fila[1] || "",
            apellido: fila[2] || "",
            email: fila[3] || "",
            servicio: fila[4] || "",
            fecha: fila[5] || "",
            barbero: fila[6] || "",
            horario: fila[7] || "",
            metodoPago: fila[8] || "",
        }

        turnos.push(nuevoturno)
    })

    console.log("[v0] Turnos cargados:", turnos)
    return turnos
}

async function agregarTurno(turnoData) {
    if (!window.gapi || !window.gapi.client) {
        console.error("[v0] Google API no está disponible aún")
        return false
    }

    if (!window.googleAuthComplete) {
        console.warn("[v0] Esperando autenticación antes de agregar turno...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const ultimoId = turnos.length > 0 ? Math.max(...turnos.map((t) => Number.parseInt(t.id))) : 0

    const nuevaFila = [
        (ultimoId + 1).toString(),
        turnoData.nombre,
        turnoData.apellido,
        turnoData.email,
        turnoData.servicio,
        turnoData.fecha,
        turnoData.nombreBarbero,
        turnoData.horario,
        turnoData.pago,
    ]

    try {
        console.log("[v0] Agregando turno a Google Sheets:", nuevaFila)
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:I`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [nuevaFila],
            },
        })

        if (response.status === 200) {
            console.log("[v0] Turno agregado a Google Sheets exitosamente")
            await getTurnos()
            return true
        }
    } catch (err) {
        console.error("[v0] Error al agregar turno a Google Sheets:", err)
        return false
    }
}
