var tools = null;
var main = null;
var juego = null;
var usuario = null

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

window.addEventListener("DOMContentLoaded", () => {
  tools = new Tools();
  main = new Main();
  juego = new Juego();
  comprobacionUsuario();
});