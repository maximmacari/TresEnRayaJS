var tools = null;
var main = null;
var juego = null;

class Main{
  constructor(){
    this.formLogIn = document.getElementById("formLogin");
    this.jugador = {
      username: "none",
      hash: "",
      maxScore: 0,
      score: 0
    };
  }

  logIn(){
    let dataSend = {
      username: this.formLogIn.elements.username.value,
      password: this.formLogIn.elements.password.value
    }

    tools.httpPost("/login", JSON.stringify(dataSend), (msg) => {
      let resp = JSON.parse(msg);

      if(resp.loginState){
        tools.showModal("Iniciar sesión", `Has iniciado sesión, bienvenido ${dataSend.username}`);
        
        this.jugador.username = resp.username;
        this.jugador.maxScore = resp.maxScore;
        this.jugador.hash = resp.hash;

        juego.init();
      }else{
        tools.showModal("Iniciar sesión", "Usuario o contraseña incorrectos");
      }
    }, (err) => {
      console.error(err);
    });
  }

  signUp(){

  }
}

class Juego{
  constructor(){
    this.width = 400;
    this.height = 450;
    this.offsetX = 0;
    this.offsetY = 0;

    this.ws = null;
    this.isRunning = true;

    this.usuariosList = document.getElementById("usuariosList");
    this.canvas = document.getElementById("canvasMain");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = null;

    this.casillas = [];
  }

  canvasCalcOffset(){
    let bounds = this.canvas.getBoundingClientRect();
    this.offsetX = bounds.left;
    this.offsetY = bounds.top;  
  }

	//crear celdas
  generarCasillas(){
    let marginTop = 50;
    let nCasillas = [4, 4];
    let margin = 2;
    let paddingX = 20;
    let paddingY = 20;
    let casillaSize = {
      w: (this.width / nCasillas[0]),
      h: ((this.height - marginTop) / nCasillas[1])
    };

    casillaSize.w = (casillaSize.w - ((paddingX * 2) / nCasillas[0]));
    casillaSize.h = (casillaSize.h - ((paddingY * 2) / nCasillas[1]));
     
    console.log(casillaSize);

    for(let k=0; k<nCasillas[1]; k++){
      let y = (k * (casillaSize.h + margin * 2)) + marginTop;
      y += paddingY;

      for(let i=0; i<nCasillas[0]; i++){
        let x = i * (casillaSize.w + margin);
        
        x += paddingX;

        let casilla = {
          x: x,
          y: y,
          w: casillaSize.w - (margin * 2),
          h: casillaSize.h - (margin * 2),
          color: "#000"
        };

        casilla.color = "#0f0";

        this.casillas.push(casilla);
      }
    }
  }

  init(){
    this.ctx = this.canvas.getContext('2d');

    this.generarCasillas();

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    this.ws = new WebSocket('ws://localhost:4741');

    this.ws.onopen = function () {
      console.log("OPEN");
      let userData = {
        nombre: juego.user.username
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

    this.canvas.addEventListener("keypress", function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      console.log(ev);
      
    });

    this.canvas.addEventListener("mousedown", function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      juego.canvasCalcOffset();

      let mouseX = parseInt(ev.clientX-juego.offsetX);
      let mouseY = parseInt(ev.clientY-juego.offsetY);

      for(let casilla of juego.casillas){
        if(mouseX >= casilla.x && mouseY >= casilla.y 
          && mouseX <= (casilla.x + casilla.w) 
          && mouseY <= (casilla.y + casilla.h)){
          
        }
      }
    });

    this.canvas.addEventListener("mousemove", function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      juego.canvasCalcOffset();

      let mouseX = parseInt(ev.clientX-juego.offsetX);
      let mouseY = parseInt(ev.clientY-juego.offsetY);

      for(let casilla of juego.casillas){
        if(mouseX >= casilla.x && mouseY >= casilla.y 
          && mouseX <= (casilla.x + casilla.w) 
          && mouseY <= (casilla.y + casilla.h)){
		      //si el raton coincide con una casilla o está encima de ella
		  
        }
      }
    });

    setInterval(function(){
      let dataSend = {
        type: "getMap",
        data: ""
      };
	  
      juego.ws.send(JSON.stringify(dataSend));
      juego.update();
    }, 500);

    // RENDERIZAR
    requestAnimationFrame(this.render);
  }

  update(){

  }

  render(){
    console.log("Running...");
  //limpiar pantalla
    juego.ctx.clearRect(0, 0, juego.canvas.width, juego.canvas.height);
    juego.ctx.fillStyle = "#ffffff";
    juego.ctx.fillRect(0, 0, juego.canvas.width, juego.canvas.height);

    for(let casilla of juego.casillas){
		//casilla tiene color
		juego.ctx.fillStyle = casilla.color;
		//dibujar casilla largo, alto y ancho / 'x' e 'y' son posiciones
		juego.ctx.fillRect(casilla.x, casilla.y, casilla.w, casilla.h);
    }

    juego.ctx.restore();

    //pintar letras en negro
    juego.ctx.fillStyle = "#000";
    juego.ctx.font = "30px Arial";
	  // 'x' e 'y'
    juego.ctx.fillText(main.jugador.username, 5, 30);

    if (juego.isRunning) requestAnimationFrame(juego.render);
  }
}

function logIn(){

}

window.addEventListener("load", () => {
  tools = new Tools();
  main = new Main();
  juego = new Juego();
});