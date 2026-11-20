import {
    obtenerSaldo,
    actualizarSaldo,
    suscribirCambios,
    sincronizarSaldoDesdeBD
} from "../src/state.js";
import { juegosDisponibles } from "../src/dataJuegos.js";

const parametrosURL = new URLSearchParams(window.location.search);
const juegoActualId = parametrosURL.get("juego");
let modoBotonUniversal = "APOSTAR";

const rutasJuegos = {
    dino: "../juegos/casino_crash_dino_game.html",
    ruleta: "../juegos/ruleta.html",
    blackjack: "../juegos/blackjack.html",
    slots: "../juegos/slots.html"
};

function ZonaSuperior() {
    const contenedorZona = document.getElementById("contenedor-zona-superior");
    if (contenedorZona) {
        fetch("../zona_superior.html")
            .then(response => response.text())
            .then(html => {
                const htmlCorregido = html
                    .replaceAll('src="images/', 'src="../images/')
                    .replaceAll('href="index.html"', 'href="../index.html"')
                    .replaceAll('href="inicio_sesion.html"', 'href="../inicio_sesion.html"');

                contenedorZona.innerHTML = htmlCorregido;

                const textoSaldo = document.getElementById("texto-saldo");
                if (textoSaldo) {
                    textoSaldo.textContent = `$${obtenerSaldo().toLocaleString("es-CL")} CLP`;
                }

                suscribirCambios((nuevoEstado) => {
                    if (nuevoEstado && textoSaldo) {
                        textoSaldo.textContent = `$${nuevoEstado.saldo.toLocaleString("es-CL")} CLP`;
                    }
                });

                sincronizarSaldoDesdeBD();

                const btnDeposito = contenedorZona.querySelector(".boton-deposito");
                if (btnDeposito) {
                    btnDeposito.addEventListener("click", async () => {
                        const montoStr = prompt("Ingrese el monto a depositar en CLP:", "10000");
                        if (!montoStr) return;
                        const monto = Number(montoStr);
                        if (isNaN(monto) || monto <= 0 || !Number.isInteger(monto)) {
                            alert("Ingresa un monto entero válido mayor a 0.");
                            return;
                        }

                        const usuario = localStorage.getItem("usuarioCasino") || "benjamin";
                        try {
                            const res = await fetch("http://localhost:3000/api/deposito", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ usuario, monto })
                            });
                            const data = await res.json();
                            if (data.ok) {
                                actualizarSaldo(data.nuevoSaldo);
                                enviarMensajeAlJuego({ tipo: "SINCRONIZAR_SALDO", saldo: data.nuevoSaldo });
                            }
                        } catch (err) {
                            const nuevoSaldo = obtenerSaldo() + monto;
                            actualizarSaldo(nuevoSaldo);
                            enviarMensajeAlJuego({ tipo: "SINCRONIZAR_SALDO", saldo: nuevoSaldo });
                        }
                    });
                }
            })
            .catch(error => console.error("Error cargando zona superior:", error));
    }
}

function enviarMensajeAlJuego(payload) {
    const frame = document.getElementById("frame-juego");
    if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(payload, "*");
    }
}

function CargarJuegoUniversal() {
    const frame = document.getElementById("frame-juego");
    if (frame && juegoActualId && rutasJuegos[juegoActualId]) {
        frame.src = rutasJuegos[juegoActualId];
    }
}

window.actualizarSaldoCasino = function(nuevoSaldo) {
    actualizarSaldo(nuevoSaldo);
};

window.actualizarBotonUniversal = function(texto, modo = "APOSTAR", colorFondo = "#00e701", colorTexto = "#06181F") {
    const btnApostar = document.getElementById("btn-apostar-universal");
    modoBotonUniversal = modo;
    if (btnApostar) {
        btnApostar.textContent = texto;
        btnApostar.style.backgroundColor = colorFondo;
        btnApostar.style.color = colorTexto;
    }
};

window.validarApuestaUniversal = function(monto) {
    const saldoActual = obtenerSaldo();
    const reglasJuego = juegosDisponibles.find(j => j.id === juegoActualId) || { minBet: 0, maxBet: 9999999 };
    const cajaError = document.getElementById("overlay-error-universal");
    const textoError = document.getElementById("texto-error-universal");

    function dispararError(mensaje) {
        if (textoError) textoError.textContent = mensaje;
        if (cajaError) {
            cajaError.style.display = "flex";
            setTimeout(() => {
                cajaError.style.display = "none";
            }, 3500);
        }
    }

    if (monto === "" || monto === null || isNaN(monto)) {
        dispararError("Error: Ingresa un monto numérico válido.");
        return false;
    }
    const montoNum = Number(monto);
    if (montoNum <= 0 || !Number.isInteger(montoNum)) {
        dispararError("Error: La apuesta debe ser un número entero y mayor a 0.");
        return false;
    }
    if (montoNum > saldoActual) {
        dispararError(`Error: Saldo insuficiente. Tienes $${saldoActual.toLocaleString("es-CL")} CLP.`);
        return false;
    }
    if (montoNum < reglasJuego.minBet) {
        dispararError(`Error: La apuesta mínima es de $${reglasJuego.minBet.toLocaleString("es-CL")} CLP.`);
        return false;
    }
    if (montoNum > reglasJuego.maxBet) {
        dispararError(`Error: La apuesta máxima es de $${reglasJuego.maxBet.toLocaleString("es-CL")} CLP.`);
        return false;
    }
    return true;
};

window.registrarApuestaEnBase = async function(idJuego, montoApostado, resultadoMultiplicador, saldoFinal) {
    try {
        const usuarioActual = localStorage.getItem("usuarioCasino") || "benjamin";
        const respuesta = await fetch("http://localhost:3000/api/partidas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuarioActual,
                juegoId: idJuego || juegoActualId,
                apuesta: montoApostado,
                multiplicador: resultadoMultiplicador,
                saldoPosterior: saldoFinal
            })
        });

        const data = await respuesta.json();
        if (data.ok) {
            console.log("Partida guardada con éxito", data.partida);
        }
    } catch (error) {
        console.error("Error al conectar con la API del casino:", error);
    }
};

function inicializarControlesUniversales() {
    const juegoActual = juegosDisponibles.find(j => j.id === juegoActualId);
    const nombreEl = document.getElementById("nombre-juego-activo");
    const limitesEl = document.getElementById("limites-apuesta-activo");
    const inputMonto = document.getElementById("input-apuesta-universal");
    const btnApostar = document.getElementById("btn-apostar-universal");
    const botonesRapidos = document.querySelectorAll(".btn-rapido");

    if (juegoActual) {
        if (nombreEl) nombreEl.textContent = juegoActual.nombre;
        if (limitesEl) {
            limitesEl.textContent = `Min: $${juegoActual.minBet.toLocaleString("es-CL")} | Max: $${juegoActual.maxBet.toLocaleString("es-CL")}`;
        }
        if (inputMonto) inputMonto.value = juegoActual.minBet;
    }

    botonesRapidos.forEach(btn => {
        btn.addEventListener("click", () => {
            if (!inputMonto) return;
            let actual = parseInt(inputMonto.value, 10) || 0;
            const accion = btn.dataset.accion;

            if (accion === "+1000") actual += 1000;
            else if (accion === "+5000") actual += 5000;
            else if (accion === "HALF") actual = Math.max(1, Math.floor(actual / 2));
            else if (accion === "DOUBLE") actual = actual * 2;
            else if (accion === "MAX") {
                const maxPermitido = juegoActual ? juegoActual.maxBet : obtenerSaldo();
                actual = Math.min(obtenerSaldo(), maxPermitido);
            }

            inputMonto.value = actual;
            enviarMensajeAlJuego({
                tipo: "ACTUALIZAR_MONTO",
                juego: juegoActualId,
                monto: actual
            });
        });
    });

    if (inputMonto) {
        inputMonto.addEventListener("input", () => {
            enviarMensajeAlJuego({
                tipo: "ACTUALIZAR_MONTO",
                juego: juegoActualId,
                monto: Number(inputMonto.value) || 0
            });
        });
    }

    if (btnApostar) {
        btnApostar.addEventListener("click", () => {
            const monto = inputMonto ? inputMonto.value : 0;

            if (modoBotonUniversal === "APOSTAR") {
                if (!window.validarApuestaUniversal(monto)) return;
            }

            enviarMensajeAlJuego({
                tipo: "ACCION_UNIVERSAL",
                accion: modoBotonUniversal,
                juego: juegoActualId,
                monto: Number(monto)
            });
        });
    }
}

window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || !data.tipo) return;

    if (data.tipo === "ACTUALIZAR_SALDO" && typeof data.saldo === "number") {
        actualizarSaldo(data.saldo);
    } else if (data.tipo === "REGISTRAR_PARTIDA") {
        window.registrarApuestaEnBase(data.juegoId, data.apuesta, data.multiplicador, data.saldoPosterior);
    } else if (data.tipo === "ESTADO_BOTON_UNIVERSAL") {
        window.actualizarBotonUniversal(data.texto, data.modo, data.colorFondo, data.colorTexto);
    }
});

const btnVolver = document.getElementById("btn-volver");
if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}

ZonaSuperior();
CargarJuegoUniversal();
inicializarControlesUniversales();