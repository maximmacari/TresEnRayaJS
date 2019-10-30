
let Usuario = {
  username  : null,
  pass  : null,
}
//Comprobar si hay usuario en localstorage y si lo hay lo inserta en una tabla


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
    <button onclick="sesionUsuario.borrarSesion()" >Borrar</button>
  `.trim()
  espacioUsuario.innerHTML = tabla
}