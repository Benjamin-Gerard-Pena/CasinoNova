const estado = {
    saldo: 1000000, // Saldo inicial ficticio
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
    estado.saldo = nuevoSaldo;
    notificarCambios();
}

export function seleccionarJuego(juego) {
    estado.juegoSeleccionado = juego;
    notificarCambios();
}

export function obtenerJuegoSeleccionado() {
    return estado.juegoSeleccionado;
}