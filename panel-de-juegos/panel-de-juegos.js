import { obtenerSaldo, actualizarSaldo, suscribirCambios } from "../src/state.js";
import { juegosDisponibles } from "../src/dataJuegos.js";

function ZonaSuperior (){
    const contenedorZona = document.getElementById("contenedor-zona-superior");
    if (contenedorZona) {
        fetch("../zona_superior.html")
            .then(response => response.text())
            .then(html=> {
                contenedorZona.innerHTML = html;
                const textoSaldo = document.getElementById("texto-saldo");
                if (textoSaldo) {
                    textoSaldo.textContent = `$${obtenerSaldo().toLocaleString("es-CL")} CLP`;
                }
                suscribirCambios((nuevoEstado) => {
                    if (nuevoEstado) {
                        textoSaldo.textContent = `$${nuevoEstado.saldo.toLocaleString("es-CL")} CLP`;
                    }
                });
            })
            .catch(error => console.log("la cagamos en algo",error));}
}

ZonaSuperior();
window.actualizarSaldoCasino = function(nuevoSaldo) {
    actualizarSaldo(nuevoSaldo);
};
function CargarJuegoUniversal(){
    const parametros = new URLSearchParams(window.location.search);
    const juegoelegido = parametros.get("juego");
    const frame = document.getElementById("frame-juego");
    if (frame && juegoelegido){
        if (juegoelegido == "dino"){
            frame.src = "../juegos/casino_crash_dino_game.html";
        }
        else if (juegoelegido == "ruleta"){
            frame.src = "../juegos/ruleta/index.html";
        }
        else if (juegoelegido == "blackjack"){
            frame.src = "../juegos/black/index.html";
        }
        else if (juegoelegido == "slots"){
            frame.src = "../juegos/avion/index.html";
        }
    }
}
CargarJuegoUniversal();
const btnVolver = document.getElementById("btn-volver");
if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}
window.validarApuestaUniversal= function (monto){
    const saldoActual = obtenerSaldo();
    const parametros = new URLSearchParams(window.location.search);
    const juegoelegido = parametros.get("juego");
    const reglasJuego = juegosDisponibles.find(j => j.id === juegoelegido) || { minBet: 0, maxBet: 9999999 };
    const cajaError = document.getElementById("overlay-error-universal");
    const textoError = document.getElementById("alerta-error-universal");
    function dispararError(mensaje) {
        textoError.textContent = mensaje;
        cajaError.style.display = "flex";
        setTimeout(() => {
            cajaError.style.display = "none";
        }, 3500);
    }
    if (monto === "" || monto === null || isNaN(monto)) {
        dispararError("Error: Ingresa un monto numérico válido.");
        return false;
    }
    const montoNum = Number(monto);
    if(montoNum<=0 || !Number.isInteger(montoNum)){
        dispararError("Error: La apuesta debe ser un número entero y mayor a 0.")
        return false;
    }
    if(montoNum > saldoActual){
        dispararError("Error: el saldo es insuficiente")
        return false;
    }
    if(montoNum < reglasJuego.minBet){
        dispararError("Error: estas bajo la apuesta minima ")
        return false;
    }
    if(montoNum > reglasJuego.maxBet){
        dispararError("Error: estas sobre la apuesta maxima ")
        return false;
    }
    return true;
}

