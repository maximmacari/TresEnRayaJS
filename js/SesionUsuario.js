class SesionUsuario {
    constructor (){

    }

    cargarUsuario(){
        let usuarioSesion = {}
        usuarioSesion.usuario = localStorage.getItem("user")
        usuarioSesion.puntos = localStorage.getItem("puntos")
    }
    pruebaOffline(){
        localStorage.setItem("user","Jorge");
        localStorage.setItem("puntos","123456");
    }
}