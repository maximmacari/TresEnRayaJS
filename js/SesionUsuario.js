class SesionUsuario {
    constructor (){

    }

    cargarUsuario(){
        let usuarioSesion = {}
        usuarioSesion.username = localStorage.getItem("username")
        usuarioSesion.maxScore = localStorage.getItem("maxScore")

        return JSON.stringify(usuarioSesion);
    }
    guardarUsuario(usuarioSesion){
        localStorage.setItem("username",usuarioSesion.username);
        localStorage.setItem("maxScore",usuarioSesion.maxScore);
    }
    limpiarStorage(){
        localStorage.clear()
    }
}