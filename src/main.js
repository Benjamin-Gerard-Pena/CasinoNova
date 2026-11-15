import { juegosDisponibles } from "./dataJuegos.js";
import {
  obtenerSaldo,
  actualizarSaldo,
  seleccionarJuego,
  suscribirCambios,
  sincronizarSaldoDesdeBD
} from "./state.js";

function iniciarCasino() {
  const contenedorJuegos = document.getElementById("contenedor-juegos");
  const textoSaldo = document.getElementById("texto-saldo");
  const barraBusqueda = document.getElementById("barra");
  const btnDeposito = document.querySelector(".boton-deposito");

  function mostrarDineroCLP(monto) {
    return `$${Number(monto).toLocaleString("es-CL")} CLP`;
  }

  function mostrarSaldo(nuevoEstado) {
    if (textoSaldo && nuevoEstado) {
      textoSaldo.textContent = mostrarDineroCLP(nuevoEstado.saldo);
    }
  }

  suscribirCambios(mostrarSaldo);
  mostrarSaldo({ saldo: obtenerSaldo() });
  sincronizarSaldoDesdeBD();

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
        }
      } catch (err) {
        actualizarSaldo(obtenerSaldo() + monto);
      }
    });
  }

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
          <p>Apuesta min: ${mostrarDineroCLP(juego.minBet)} | max: ${mostrarDineroCLP(juego.maxBet)}</p>
          <p>${juego.regla}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        seleccionarJuego(juego);
        localStorage.setItem("saldoCasino", obtenerSaldo());
        window.location.href = `panel-de-juegos/pagina-principal-de-juegos.html?juego=${juego.id || juego.nombre.toLowerCase()}`;
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
}

if (window.headerYaEstaListo) {
  iniciarCasino();
} else {
  window.addEventListener("headerListo", iniciarCasino);
}