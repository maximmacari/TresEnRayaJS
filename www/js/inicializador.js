var tools = null;
var main = null;
var juego = null;
var sesionUsuario = null;

window.addEventListener("DOMContentLoaded", () => {
  tools = new Tools();
  sesionUsuario = new SesionUsuario();
  main = new Main();
  juego = new Juego();
  
  main.comprobacionUsuario();
});