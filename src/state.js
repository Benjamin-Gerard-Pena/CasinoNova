const saldoGuardado = localStorage.getItem("saldoCasino");
const estado = {
    saldo: saldoGuardado !== null ? parseInt(saldoGuardado, 10) : 100000,
    juegoSeleccionado: null
};

const jugador = [];

export function suscribirCambios(callback) {
    jugador.push(callback);
}

function notificarCambios() {
    jugador.forEach((callback) => callback(estado));
}

export function obtenerSaldo() {
    return estado.saldo;
}

export function actualizarSaldo(nuevoSaldo) {
    estado.saldo = Number(nuevoSaldo);
    localStorage.setItem("saldoCasino", estado.saldo);
    notificarCambios();
}

export function seleccionarJuego(juego) {
    estado.juegoSeleccionado = juego;
    notificarCambios();
}

export function obtenerJuegoSeleccionado() {
    return estado.juegoSeleccionado;
}

export async function sincronizarSaldoDesdeBD() {
    const usuarioActual = localStorage.getItem("usuarioCasino") || "benjamin";
    try {
        const res = await fetch(`http://localhost:3000/api/saldo/${usuarioActual}`);
        const data = await res.json();
        if (data.ok && typeof data.saldo === "number") {
            actualizarSaldo(data.saldo);
        }
    } catch (err) {
        console.warn("Usando saldo local mientras conecta la API...");
    }
}