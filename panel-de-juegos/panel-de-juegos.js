function CargarHeader() {
const contenedor = document.getElementById("contenedor-header-pricipal");
if (contenedor) {
    fetch("../header.html")
    .then(response => response.text())
    .then(codigohtml=> {contenedor.innerHTML = codigohtml})
    .catch(error => console.error("fallo la carga del header",error));}
}
function ZonaSuperior (){
    const contenedorZona = document.getElementById("contenedor-zona-superior");
    if (contenedorZona) {
        fetch("../zona_superior.html")
            .then(response => response.text())
            .then(html=> {document.getElementById("contenedor-zona-superior").innerHTML = html})
            .catch(error => console.log("la cagamos en algo",error));}
}
CargarHeader();
ZonaSuperior();
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
