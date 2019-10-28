var tools = null
let Usuario = {
  username  : null,
  pass  : null,
}
var sesion = new SesionUsuario();

//Comprobar si hay usuario en localstorage
window.addEventListener("DOMContentLoaded",()=>{
  if(localStorage.getItem("username")!=null){
    getUsuario(sesion.cargarUsuario())
  }else{

  }
});

function postUsuario(){
  let jugador = Object.create(Usuario)
  jugador.username = email.value
  jugador.pass = pwd.value
  console.log("Iniciando peticion post:"+jugador)
  peticionPost(jugador)
  //getUsuario(jugador)
}

function peticionPost(usuarioPost){
  let usuarioJSON = JSON.stringify(usuarioPost)
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log("Este es la respuesta"+this.response)
      peticionGet(usuarioJSON)
    }
  };
  xhttp.open("POST", "http://192.168.3.148:4740/signup", true);
  xhttp.setRequestHeader("Content-Type", "application/json")
  xhttp.send(usuarioJSON);
}
function peticionGet(usuario){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log("Este es la respuesta /login"+this.response)
      getUsuario(this.response)
    }
  };
  xhttp.open("POST", "http://192.168.3.148:4740/login", true);
  xhttp.setRequestHeader("Content-Type", "application/json")
  xhttp.send(usuario);
}

// window.addEventListener("DOMContentLoaded", () =>{
//   tools = new Tool();
//   let linksMenu = menu.getElementsByClassName("nav-link");
//   for(let link of linksMenu){
//     link.addEventListener("click",() => {
//       let pagina = {
//         pagina : link.dataset.pagina
//       }
//       console.log(link.dataset.pagina)
//       let paginaJson = JSON.stringify(pagina); 
//       tools.httpPost("http://192.168.3.128:4740/getView",paginaJson,(msg)=>{
//         contenido.innerHTML = msg;
//       });
//     });
//   };
// });

function registrar(){
  let formulario = `
  <form id="formLogin">
  <h4 class="text-center">Iniciar sesión</h4>
  <div class="form-group">
    <label for="username">Usuario</label>
    <input type="text" class="form-control" name="username" placeholder="Nombre de usuario">
  </div>
  <div class="form-group">
    <label for="password">Introduce tu contraseña:</label>
    <input type="password" class="form-control" name="password" placeholder="Contraseña">
  </div>
  <input type="button" value="Enviar" onclick="main.logIn()" class="btn btn-primary btn-block" />
</form>
  `
}

function tablaUsuario(objetoJSON){
  let dato = JSON.parse(objetoJSON)
  let tabla =`
      <table class="table table-striped">
        <thead>
            <tr>
                <th>Usuario</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${dato.username}</td>
            </tr>
        </tbody>
    </table>
    <table class="table table-striped">
      <thead>
          <tr>
              <th>Maxima Puntuación</th>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td>${dato.maxScore}</td>
          </tr>
      </tbody>
    </table>
    <button onclick="borrarSesion()" >Borrar</button>
  `.trim()
  espacioUsuario = tabla
}