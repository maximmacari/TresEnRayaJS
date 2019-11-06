class Juego {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;

    this.ws = null;
    this.isRunning = true;

    this.usuariosList = document.getElementById("usuariosList");
    this.tablero = document.getElementById("tablero");

    
    this.casillas = [];
  }

  celdaClick(position) {
    let dataSend = {
      type: "celdaClick",
      data: {
        nombreSala: main.sala,
        position: position,
        jugadorHash: main.jugadorHash
      }
    };

    this.ws.send(JSON.stringify(dataSend));

    new Audio("./res/sound/inicio_juego_sound.wav").play();
  }

  generarTablero(sala) {
    let nCasillas = [3, 3];

    this.casillas = [];

    for (let i = 0; i < nCasillas[1]; i++) {
      let filaCasillas = [];

      for (let k = 0; k < nCasillas[0]; k++) {
        let casilla = {
          position: {
            x: k,
            y: i
          },
          value: "none"
        };

        filaCasillas.push(casilla);
      }

      sala.tablero.push(filaCasillas);
    }
  }

  actualizarCasillas() {
    console.log("ACTUALIZANDO CASILLAS");

    let rows = this.tablero.getElementsByTagName("tr");

    let svgCruz = `
    <svg aria-label="X" class="cruz" role="img" viewBox="0 0 128 128">
      <path class="casilla-cruz" d="M16,16L112,112"></path>
      <path class="casilla-cruz" d="M112,16L16,112"></path>
    </svg>
    `.trim();
    let svgCirculo = `
    <svg aria-label="O" class="circulo" role="img" viewBox="0 0 128 128">
      <path class="casilla-circulo" d="M64,16A48,48 0 1,0 64,112A48,48 0 1,0 64,16"></path>
    </svg>
    `.trim();

    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let cols = row.getElementsByTagName("td");

      for (let k = 0; k < cols.length; k++) {
        let col = cols[k];
        let casillaValue = juego.casillas[i][k].value;

        console.log(casillaValue);

        if (casillaValue === "circulo") {
          col.getElementsByClassName("casilla")[0].innerHTML = svgCirculo;
        } else if (casillaValue === "cruz") {
          col.getElementsByClassName("casilla")[0].innerHTML = svgCruz;
        } else {
          col.getElementsByClassName("casilla")[0].innerHTML = "";
        }
      }
    }
  }

  //Borra la tabla entera y la vuelve a pintar
  pintarCasillas() {
    if (this.tablero.childElementCount <= 0) {
      console.log("Pintando");
      this.tablero.innerHTML = "";

      let svgCruz = `
      <svg aria-label="X" class="cruz" role="img" viewBox="0 0 128 128">
        <path class="casilla-cruz" d="M16,16L112,112"></path>
        <path class="casilla-cruz" d="M112,16L16,112"></path>
      </svg>
      `.trim();
      let svgCirculo = `
      <svg aria-label="O" class="circulo" role="img" viewBox="0 0 128 128">
        <path class="casilla-circulo" d="M64,16A48,48 0 1,0 64,112A48,48 0 1,0 64,16"></path>
      </svg>
      `.trim();

      for (let fila of juego.casillas) {
        let row = document.createElement("tr");

        for (let celda of fila) {
          let htmlCasilla = `
          <div class="casilla">
          </div>
          `;
          let celdaCasilla = document.createElement("td");
          celdaCasilla.innerHTML = htmlCasilla;

          celdaCasilla.addEventListener("click", () => {
            juego.celdaClick(celda.position);
          });

          row.appendChild(celdaCasilla);
        }

        this.tablero.appendChild(row);
      }
    } else {
      juego.actualizarCasillas();
    }
  }

  //crear celdas
  generarCasillas() {
    let nCasillas = [3, 3];
    let casillas = [];

    for (let i = 0; i < nCasillas[1]; i++) {
      let filaCasillas = [];

      for (let k = 0; k < nCasillas[0]; k++) {
        let casilla = {
          position: {
            x: k,
            y: i
          },
          value: "none"
        };

        filaCasillas.push(casilla);
      }

      casillas.push(filaCasillas);
    }

    return casillas;
  }

  requestTablero() {
    let dataSend = {
      type: "getTablero",
      data: {
        nombreSala: main.sala
      }
    };

    juego.ws.send(JSON.stringify(dataSend));
  }

  init() {
    main.displayJuego();

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    this.ws = new WebSocket('ws://' + juego.wsHost);

    this.ws.onopen = function () {
      let dataSend = {
        type: "registrarJugador",
        data: {
          jugadorHash: main.jugadorHash
        }
      };
      juego.ws.send(JSON.stringify(dataSend));

      juego.requestTablero();
      juego.intervalUpdate = setInterval(function () {
        juego.requestTablero();
      }, 10000);
    };

    this.ws.onclose = function () {
      clearInterval(juego.intervalUpdate);
      console.log("Conexión cerrada");
    }

    this.ws.onerror = function (error) {
      clearInterval(juego.intervalUpdate);
      console.error("ERROR WS: " + error);
    };

    this.ws.onmessage = function (message) {
      try {
        let msg = JSON.parse(message.data);

        if (msg.type === "clients") {
          for (let client of msg.data) {
            let root = document.createElement("div");
            let html = `
              <li>
                ${client.username}
              </li>
            `.trim();
            root.innerHTML = html;

            juego.usuariosList.getElementsByTagName("ul")[0]
              .appendChild(root.firstChild);
          }
        } else if (msg.type === "tablero") {
          juego.casillas = msg.data.tablero;
          juego.pintarCasillas(juego.generarCasillas());
        } else if (msg.type === "registrarJugador") {
          if (msg.data.result) {
            console.log("JUGADOR REGISTRADO");
          } else {
            console.log("ERROR AL REGISTRAR JUGADOR");
          }
        }
      } catch (e) {
        console.error(e);

        return;
      }
      // handle incoming message
    };
  }
}