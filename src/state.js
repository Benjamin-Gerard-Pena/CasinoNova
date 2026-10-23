const estado = {
    saldo: 1000000, // Saldo inicial ficticio
    juegoSeleccionado: null
};

const suscriptores = [];

export function suscribirCambios(callback) {
    suscriptores.push(callback);
}

function notificarCambios() {
    suscriptores.forEach((callback) => callback(estado));
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