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