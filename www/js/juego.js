class Juego{
  constructor(){
    this.width = 400;
    this.height = 400;
    this.offsetX = 0;
    this.offsetY = 0;

    this.ws = null;
    this.isRunning = true;

    this.usuariosList = document.getElementById("usuariosList");
    this.tablero = document.getElementById("tablero");
    this.tablero.style.width = this.width + "px";
    this.tablero.style.height = this.height + "px";

    this.casillas = [];
  }

  canvasCalcOffset(){
    let bounds = this.canvas.getBoundingClientRect();
    this.offsetX = bounds.left;
    this.offsetY = bounds.top;  
  }

	//crear celdas
  generarCasillas(){
    let nCasillas = [3, 3];

    this.tablero.innerHTML = "";

    for(let i=0;i<nCasillas[1];i++){
      let filaCasilla = document.createElement("tr");

      for(let k=0;k<nCasillas[0];k++){
        let htmlCasilla = `
        <td>
          <svg aria-label="X" role="img" viewBox="0 0 128 128" style="visibility: visible;display: none;">
            <path class="casilla-cruz" d="M16,16L112,112" style="stroke: rgb(84, 84, 84); stroke-dasharray: 135.764; stroke-dashoffset: 0;"></path>
            <path class="casilla-cruz" d="M112,16L16,112" style="stroke: rgb(84, 84, 84); stroke-dasharray: 135.764; stroke-dashoffset: 0;"></path>
          </svg>
          <svg aria-label="O" role="img" viewBox="0 0 128 128" style="visibility: visible;display: none;">
            <path class="casilla-circulo" d="M64,16A48,48 0 1,0 64,112A48,48 0 1,0 64,16" style="stroke: rgb(242, 235, 211); stroke-dasharray: 301.635; stroke-dashoffset: 0;"></path>
          </svg>
        </td>
        `;
        let celdaCasilla = document.createElement("td");
        celdaCasilla.innerHTML = htmlCasilla;

        if(circulo){
          celdaCasilla.getElementsByTagName("svg")[0].style.display = "none";
          celdaCasilla.getElementsByTagName("svg")[1].style.display = "block";
        }else{
          celdaCasilla.getElementsByTagName("svg")[0].style.display = "block";
          celdaCasilla.getElementsByTagName("svg")[1].style.display = "none";
        }

        filaCasilla.appendChild(celdaCasilla);
      }

      this.tablero.appendChild(filaCasilla);
    }
  }

  init(){
    this.generarCasillas();

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    this.ws = new WebSocket('ws://localhost:4741');

    this.ws.onopen = function () {
      console.log("OPEN");
      let userData = {
        nombre: main.jugador.username
      };

      let dataSend = {
        type: "userData",
        data: userData
      };

      juego.ws.send(JSON.stringify(dataSend));
    };

    this.ws.onerror = function (error) {
      console.error(error);
      
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
                ${client.nombre} - ${client.nivel}
              </li>
            `.trim();
            root.innerHTML = html;

            juego.usuariosList.getElementsByTagName("ul")[0]
            .appendChild(root.firstChild);
          }
        }else{

        }
      } catch (e) {
        console.error(e);

        return;
      }
      // handle incoming message
    };

    setInterval(function(){
      let dataSend = {
        type: "getMap",
        data: ""
      };
	  
      juego.ws.send(JSON.stringify(dataSend));
      juego.update();
    }, 500);
  }

  update(){

  }
}