class Juego {
  constructor() {
    this.offsetX = 0;
    this.offsetY = 0;

    this.wsHost = `${window.location.hostname}:4741`;

    this.ws = null;
    this.isRunning = true;

    this.usuariosList = document.getElementById("usuariosList");
    this.tablero = null;

    this.casillas = [];
    this.turno = 1;
    this.online = false;
  }

  comprobarGanador() {
    var casillaGanadora = null
    //tablero[0][0].value -> "cruz", "circulo", "none" [y, x]
    if (juego.casillas[0][0].value == juego.casillas[0][1].value
      && juego.casillas[0][1].value == juego.casillas[0][2].value
      && juego.casillas[0][0].value !== "none") casillaGanadora = juego.casillas[0][0];
    else if (juego.casillas[1][0].value == juego.casillas[1][1].value
      && juego.casillas[1][1].value == juego.casillas[1][2].value
      && juego.casillas[1][0].value !== "none") casillaGanadora = juego.casillas[1][0];
    else if (juego.casillas[2][0].value == juego.casillas[2][1].value
      && juego.casillas[2][1].value == juego.casillas[2][2].value
      && juego.casillas[2][0].value !== "none") casillaGanadora = juego.casillas[2][0];
    //Las líneas verticales
    else if (juego.casillas[0][0].value == juego.casillas[1][0].value
      && juego.casillas[1][0].value == juego.casillas[2][0].value
      && juego.casillas[0][0].value !== "none") casillaGanadora = juego.casillas[0][0];
    else if (juego.casillas[0][1].value == juego.casillas[1][1].value
      && juego.casillas[1][1].value == juego.casillas[2][1].value
      && juego.casillas[0][1].value !== "none") casillaGanadora = juego.casillas[0][1];
    else if (juego.casillas[0][2].value == juego.casillas[1][2].value
      && juego.casillas[1][2].value == juego.casillas[2][2].value
      && juego.casillas[0][2].value !== "none") casillaGanadora = juego.casillas[0][2];
    //Las diagonales
    else if (juego.casillas[0][0].value == juego.casillas[1][1].value
      && juego.casillas[1][1].value == juego.casillas[2][2].value
      && juego.casillas[0][0].value !== "none") casillaGanadora = juego.casillas[0][0];
    else if (juego.casillas[2][0].value == juego.casillas[1][1].value
      && juego.casillas[1][1].value == juego.casillas[0][2].value
      && juego.casillas[2][0].value !== "none") casillaGanadora = juego.casillas[2][0];
    if (casillaGanadora) {
      return casillaGanadora.value;
    } else {
      return null;
    }
  }


  celdaClick(position) {
    if (this.online) {
      let dataSend = {
        type: "celdaClick",
        data: {
          nombreSala: main.sala,
          position: position,
          jugadorHash: main.jugadorHash
        }
      };
      this.ws.send(JSON.stringify(dataSend));
    } else {
      if (juego.turno === 1) {
        if (juego.casillas[position.y][position.x].value === "none") {
          juego.casillas[position.y][position.x].value = "cruz";

          setTimeout(function () {
            let casillasLibres = [];

            for (let c = 0; c < juego.casillas.length; c++) {
              for (let f = 0; f < juego.casillas[c].length; f++) {
                if (juego.casillas[f][c].value === "none") {
                  casillasLibres.push(juego.casillas[f][c]);
                }
              }
            }

            let casillaIA = casillasLibres[Math.floor(Math.random() * casillasLibres.length)];

            juego.casillas[casillaIA.position.y][casillaIA.position.x].value = "circulo";

            console.log(casillaIA);

            juego.pintarCasillas();

            juego.turno = 1;
            juego.displayTurno();

            let ganador = juego.comprobarGanador();

            if (ganador !== null) {
              tools.showModal("Ganador", `Ganador: ${ganador}`);
              juego.isRunning = false;
            }

            new Audio("./media/pulsar.wav").play();
          }, 1000);

          juego.pintarCasillas();

          juego.turno = 2;
          juego.displayTurno();

          let ganador = this.comprobarGanador();

          if (this.comprobarGanador() !== null) {
            tools.showModal("Ganador", `Ganador: ${ganador}`);
            juego.isRunning = false;
          }

          new Audio("./media/pulsar.wav").play();
        }
      } else if (juego.turno === 2) {
        alert("No es tu turno");
      }

      juego.pintarCasillas();
    }
  }

  displayTurno() {
    if (!this.online) {
      let displayTurno1 = document.getElementsByClassName("turno-local-1")[0];
      let displayTurno2 = document.getElementsByClassName("turno-local-2")[0];

      if (juego.turno === 1) {
        displayTurno1.classList.add("turno");
        displayTurno2.classList.remove("turno");
      } else if (juego.turno === 2) {
        displayTurno1.classList.remove("turno");
        displayTurno2.classList.add("turno");
      }
    } else {
      let displayTurno1 = document.getElementsByClassName("turno-online-1")[0];
      let displayTurno2 = document.getElementsByClassName("turno-online-2")[0];

    }
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
      this.casillas.push(filaCasillas);
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
            if (juego.isRunning)
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

      this.casillas.push(filaCasillas);
    }
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

  heartbeat() {
    if (this.ws) {
      clearTimeout(this.ws.pingTimeout);

      this.ws.pingTimeout = setTimeout(() => {
        this.ws.terminate();
      }, 30000 + 1000);
    }
  }

  initLocal() {
    this.tablero = document.getElementById("tableroLocal");

    console.log

    juego.generarTablero();
    juego.pintarCasillas();
  }

  initOnline() {
    main.displayJuego();

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    this.ws = new WebSocket('ws://' + juego.wsHost);

    this.ws.onopen = function () {
      juego.heartbeat();

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
      clearTimeout(this.ws.pingTimeout);
      console.log("Conexión cerrada");
    }

    this.ws.on('ping', juego.heartbeat);

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

    //audio fondo bucle
    var audio_fondo = new Audio("./media/sonido_fondo.mp3");
    audio_fondo.volume = 0.65;
    audio_fondo.addEventListener('ended', function () {
      audio_fondo.volume = 0.17;
      this.currentTime = 0;
      this.play();
    }, false);
    audio_fondo.play();
  }

  init(online) {
    this.online = online;

    if (online) {
      juego.initOnline();
    } else {
      juego.initLocal();
    }
  }

}