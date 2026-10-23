import { juegosDisponibles } from "./dataJuegos.js";
import {
  obtenerSaldo,
  actualizarSaldo,
  seleccionarJuego,
  suscribirCambios
} from "./state.js";

document.addEventListener("DOMContentLoaded", () => {
  const contenedorJuegos = document.getElementById("contenedor-juegos");
  const textoSaldo = document.getElementById("texto-saldo");
  const barraBusqueda = document.getElementById("barra");

  function mostrarDineroCLP(monto) {
    return `$${monto.toLocaleString("es-CL")} CLP`;
  }

  function mostrarSaldo(nuevoEstado) {
    if (textoSaldo) {
      textoSaldo.textContent = mostrarDineroCLP(nuevoEstado.saldo);
    }
  }

  suscribirCambios(mostrarSaldo);
  mostrarSaldo({ saldo: obtenerSaldo() });

  function mostrarCatalogo(listaJuegos) {
    if (!contenedorJuegos) return;

    contenedorJuegos.innerHTML = "";

    if (listaJuegos.length === 0) {
      contenedorJuegos.innerHTML = `
                <p style="grid-column: 1 / -1; text-align: center; color: #A0B0B9;">
                    No se encontraron juegos que coincidan con la búsqueda.
                </p>
            `;
      return;
    }

    listaJuegos.forEach((juego) => {
      const card = document.createElement("button");
      card.className = "botton-interactivo";
      card.type = "button";

      card.innerHTML = `
                <img src="${juego.imagen}" alt="${juego.nombre}">
                <div class="info-juego">
                    <h4>${juego.nombre}</h4>
                    <p>Apuesta min: ${formatearDinero(juego.minBet)} | max: ${formatearDinero(juego.maxBet)}</p>
                    <p>${juego.regla}</p>
                </div>
            `;

      card.addEventListener("click", () => {
        seleccionarJuego(juego);
        console.log("Juego seleccionado para el Integrante 1:", juego);

        const eventoJuego = new CustomEvent("juegoSeleccionado", { detail: juego });
        window.dispatchEvent(eventoJuego);
      });

      contenedorJuegos.appendChild(card);
    });
  }

  mostrarCatalogo(juegosDisponibles);

  if (barraBusqueda) {
    barraBusqueda.addEventListener("input", (e) => {
      const texto = e.target.value.toLowerCase().trim();

      const juegosFiltrados = juegosDisponibles.filter((juego) => {
        const coincideNombre = juego.nombre.toLowerCase().includes(texto);
        const coincideRegla = juego.regla.toLowerCase().includes(texto);
        return coincideNombre || coincideRegla;
      });

      mostrarCatalogo(juegosFiltrados);
    });
  }

  window.actualizarSaldoCasino = actualizarSaldo;
});