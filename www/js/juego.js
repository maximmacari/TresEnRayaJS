class Juego{
  constructor(){
    this.offsetX = 0;
    this.offsetY = 0;

    this.ws = null;
    this.isRunning = true;

    this.usuariosList = document.getElementById("usuariosList");
    this.tablero = document.getElementById("tablero");

    this.casillas = [];
  }

  canvasCalcOffset(){
    let bounds = this.canvas.getBoundingClientRect();
    this.offsetX = bounds.left;
    this.offsetY = bounds.top;  
  }

  celdaClick(position){
    let dataSend = {
      type: "celdaClick",
      data:{
        nombreSala: main.sala,
        position: position
      }
    };

    this.ws.send(JSON.stringify(dataSend));
  }

  pintarCasillas(){
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

    for(let fila of this.casillas){
      let row = document.createElement("tr");
      
      for(let celda of fila){
        let htmlCasilla = `
        <div class="casilla">
        </div>
        `;
        let celdaCasilla = document.createElement("td");
        celdaCasilla.innerHTML = htmlCasilla;

        if(celda.value === "circulo"){
          celdaCasilla.getElementsByClassName("casilla")[0].innerHTML = svgCirculo;
        }else if(celda.value === "cruz"){
          celdaCasilla.getElementsByClassName("casilla")[0].innerHTML = svgCruz;
        }else{

        }

        celdaCasilla.addEventListener("click", () => {
          juego.celdaClick(celda.position);
        });

        row.appendChild(celdaCasilla);
      }

      this.tablero.appendChild(row);
    }
  }

	//crear celdas
  generarCasillas(){
    let nCasillas = [3, 3];

    this.casillas = [];

    for(let i=0;i<nCasillas[1];i++){
      let filaCasillas = [];

      for(let k=0;k<nCasillas[0];k++){
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

  init(){
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    this.ws = new WebSocket('ws://192.168.3.146:4741');

    this.ws.onopen = function () {
      console.log("OPEN");
      let userData = {
        username: main.jugador.username
      };

      let dataSend = {
        type: "userData",
        data: userData
      };

      juego.ws.send(JSON.stringify(dataSend));

      juego.intervalUpdate = setInterval(function(){
        let dataSend = {
          type: "getTablero",
          data: {
            nombreSala: main.sala
          }
        };

        juego.ws.send(JSON.stringify(dataSend));
      }, 1000);
    };

    this.ws.onclose = function(){
      console.log("Conexión cerrada");
    }

    this.ws.onerror = function (error) {
      console.error("ERROR WS: " + error);
    };

    this.ws.onmessage = function (message) {
      try {
        let msg = JSON.parse(message.data);

        console.log(msg);

        if(msg.type === "clients"){
          for(let client of msg.data){
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
        }else if(msg.type === "tablero"){
          juego.casillas = msg.data.tablero;
          juego.pintarCasillas();
        }
      } catch (e) {
        console.error(e);

        return;
      }
      // handle incoming message
    };
  }

  update(){

  }
}