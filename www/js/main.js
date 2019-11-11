class Main {
  constructor() {
    this.formLogIn = document.getElementById("formLogin");
    this.contSalas = document.getElementById("contSalas");
    this.contJuego = document.getElementById("contJuego");
    this.tabla = document.getElementById("tablaUsuario")

    this.jugadorHash = null;
    this.sala = null;
  }
  
  comprobacionUsuario() {
    if (localStorage.getItem("jugadorHash") !== null) {
      let dataSend = {
        hash: localStorage.getItem("jugadorHash")
      };

      tools.httpPost("/login", JSON.stringify(dataSend), function (msg) {
        let resp = JSON.parse(msg);

        if (resp.loginState) {
          tools.showModal("Iniciar sesión", `Has iniciado sesión, bienvenido ${resp.username}`);

          main.jugadorHash = resp.hash;

          main.displayTabla();
          main.listarSalas();
        }
      }, function (err) {
        console.error(err);
      });
    } else {
      this.tabla.style.display = "none";
    }
  }

  logIn() {
    let dataSend = {
      username: this.formLogIn.elements.username.value,
      password: this.formLogIn.elements.password.value
    };

    tools.httpPost("/login", JSON.stringify(dataSend), (msg) => {
      let resp = JSON.parse(msg);

      if (resp.loginState) {
        tools.showModal("Iniciar sesión", `Has iniciado sesión, bienvenido ${dataSend.username}`);

        main.jugadorHash = resp.hash;
        sesionUsuario.guardarUsuario(main.jugadorHash);
        main.displayTabla();
        main.listarSalas();

      } else {
        tools.showModal("Iniciar sesión", "Usuario o contraseña incorrectos");
        if (confirm("¿Deseas registrarte con estos datos?")) {
          signUp(usuario, password)
        } else {

        }
      }
    }, (err) => {
      console.error(err);
    });
  }

  signUp() {

  }

  cerrarSesion() {
    sesionUsuario.borrarSesion();
    this.displayLogin();
  }

  crearSala(nombreSala, claveSala) {
    let dataSend = {
      jugador: this.jugadorHash,
      nombreSala: nombreSala,
      claveSala: claveSala
    };

    tools.httpPost("/crearSala", JSON.stringify(dataSend), function (msg) {
      let resp = JSON.parse(msg);

      tools.showModal("Crear sala", resp.msg);

      main.listarSalas();
    }, function (err) {
      console.error(err);
    });
  }

  entrarSala(nombreSala, claveSala){
    if(main.jugadorHash !== null){
      if(this.sala === null){
        let dataSend = {
          jugadorHash: this.jugadorHash,
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
    }else{
      tools.showModal("Info", "Primero tienes que iniciar sesión!");
    }
  }

  listarSalas(){
    if(main.jugadorHash !== null){
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
            let claveSala = prompt("Introduce clave para la sala [" + sala.nombre + "]");
            
            main.entrarSala(sala.nombre, claveSala);
          })
  
          tableSalas.appendChild(tr);
        }
      }, function (err) {
        console.error(err);
      });
    } else {
      tools.showModal("Info", "Ya estás en una sala!");
    }
  }

  listarSalas() {
    tools.httpGet("/listSalas", function (msg) {
      let resp = JSON.parse(msg);

      let tableSalas = document.getElementById("tableSalas")
        .getElementsByTagName("tbody")[0];

      tableSalas.innerHTML = "";

      for (let sala of resp) {
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

        tr.getElementsByClassName("btn-entrar-sala")[0].addEventListener("click", function () {
          let claveSala = prompt("Introduce clave para la sala [" + sala.nombre + "]");

          main.entrarSala(sala.nombre, claveSala);
        })

        tableSalas.appendChild(tr);
      }
    }, function (err) {
      console.error(err);
    });
  }

  crearSalaManual() {
    let nombreSala = prompt("Nombre de la sala: ");
    let claveSala = prompt("Clave de la sala: ");

    if(main.jugadorHash !== null){
      main.crearSala(nombreSala, claveSala);
    }else{
      tools.showModal("Info", "Primero tienes que iniciar sesión!");
    }
  }

  displayJuego() {
    this.contJuego.style.display = "block";
    this.contSalas.style.display = "none";
  }

  displaySalas() {
    this.contJuego.style.display = "none";
    this.contSalas.style.display = "block";
  }

  displayTabla() {
    this.tabla.style.display = "block"
    usuarioTabla.innerHTML = localStorage.getItem("jugadorHash")
    this.formLogIn.style.display = "none"
  }

  displayLogin() {
    this.tabla.style.display = "none"
    this.formLogIn.style.display = "block"
  }
}
