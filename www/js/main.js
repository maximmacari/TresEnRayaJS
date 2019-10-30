class Main{
  constructor(){
    this.formLogIn = document.getElementById("formLogin");
    this.jugador = {
      username: "none",
      hash: "",
      maxScore: 0,
      score: 0
    };
    this.sala = null;
  }
  
  comprobacionUsuario(){
    if(localStorage.getItem("username")!==null){
      tablaUsuario(sesion.getUsuarioLocal())
    }
  }

  logIn(){
    let dataSend = {
      username: this.formLogIn.elements.username.value,
      password: this.formLogIn.elements.password.value
    }

    tools.httpPost("/login", JSON.stringify(dataSend), (msg) => {
      let resp = JSON.parse(msg);
      //
      if(resp.loginState){
        tools.showModal("Iniciar sesión", `Has iniciado sesión, bienvenido ${dataSend.username}`);
        
        main.jugador.username = resp.username;
        main.jugador.maxScore = resp.maxScore;
        main.jugador.hash = resp.hash;

        main.listarSalas();
      }else{
        tools.showModal("Iniciar sesión", "Usuario o contraseña incorrectos");
        confirm("¿Deseas registrarte con estos datos?");
      }
    }, (err) => {
      console.error(err);
    });
  }

  signUp(){

  }

  crearSala(nombreSala, claveSala){
    let dataSend = {
      jugador: this.jugador,
      nombreSala: nombreSala,
      claveSala: claveSala
    };

    tools.httpPost("/crearSala", JSON.stringify(dataSend), function(msg){
      let resp = JSON.parse(msg);
      
      alert(`State: ${resp.result} | MSG: ${resp.msg}`);
    }, function(err){
      console.error(err);
    });
  }

  entrarSala(nombreSala, claveSala){
    if(this.sala === null){
      let dataSend = {
        jugador: this.jugador,
        nombreSala: nombreSala,
        claveSala: claveSala
      };

      tools.httpPost("/entrarSala", JSON.stringify(dataSend), function(msg){
        let resp = JSON.parse(msg);

        if(resp.result){
          main.sala = nombreSala;

          juego.init();

          tools.showModal("Entrar en sala", resp.msg);
        }else{
          tools.showModal("Entrar en sala", resp.msg);
        }
      }, function(err){
        console.error(err);
      });
    }else{
      tools.showModal("Info", "Ya estás en una sala!");
    }
  }

  listarSalas(){
    tools.httpGet("/listSalas", function(msg){
      let resp = JSON.parse(msg);

      let tableSalas = document.getElementById("tableSalas")
        .getElementsByTagName("tbody")[0];

      tableSalas.innerHTML = "";

      for(let sala of resp){
        let htmlSala = `
        <td class="text-center">
          ${sala.nombre}
        </td>
        <td class="text-center">
          <button class="btn btn-primary btn-block btn-entrar-sala">Entrar</button>
        </td>
        `.trim();

        let tr = document.createElement("tr");
        tr.innerHTML = htmlSala;

        tr.getElementsByClassName("btn-entrar-sala")[0].addEventListener("click", function(){
          main.entrarSala(sala.nombre, prompt("Introduce clave para la sala [" + sala.nombre + "]"));
        })

        tableSalas.appendChild(tr);
      }
    }, function(err){
      console.error(err);
    });
  }
}
