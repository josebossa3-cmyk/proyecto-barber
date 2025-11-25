// claves api y ids clientes de oauth2.0 sacadas de google cloud 
const CLIENT_ID = "166330304415-36kpcdkflh957ghjien7va6bnme4rge6.apps.googleusercontent.com"
const API_KEY = "AIzaSyCd9DkEQhYcvhdHE1BbOxKbyeF7cc6l_xc"

const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4"

const SCOPES = "https://www.googleapis.com/auth/spreadsheets"

let tokenClient
let gapiInited = false
let gisInited = false
const gapi = window.gapi 
const google = window.google 

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupGoogleAuth)
} else {
  setupGoogleAuth()
}

function setupGoogleAuth() {
  const gapiScript = document.querySelector('script[src*="apis.google.com"]')
  const gisScript = document.querySelector('script[src*="accounts.google.com"]')

  if (gapiScript) {
    gapiScript.addEventListener("load", gapiLoaded)
  }
  if (gisScript) {
    gisScript.addEventListener("load", gisLoaded)
  }
}

function gapiLoaded() {
  gapi.load("client", initializeGapiClient)
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  })
  gapiInited = true
  maybeEnableButtons()
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", 
  })
  gisInited = true
  maybeEnableButtons()
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    console.log("[v0] Google Sheets API initialized - NOW REQUESTING TOKEN")
    handleAuthClick()
  }
}

function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      console.error("[v0] Error en autenticación:", resp)
      throw resp
    }
    console.log("[v0] Authorization successful - token recibido")
    window.googleAuthComplete = true
  }

  if (gapi.client.getToken() === null) {
    console.log("[v0] Pidiendo nuevo token...")
    tokenClient.requestAccessToken({ prompt: "consent" })
  } else {
    console.log("[v0] Token existente, usando...")
    window.googleAuthComplete = true
    tokenClient.requestAccessToken({ prompt: "" })
  }
}

function handleSignoutClick() {
  const token = gapi.client.getToken()
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token)
    gapi.client.setToken("")
    document.getElementById("content").innerText = ""
    document.getElementById("authorize_button").innerText = "Authorize"
    document.getElementById("signout_button").style.visibility = "hidden"
  }
}
