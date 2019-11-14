
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