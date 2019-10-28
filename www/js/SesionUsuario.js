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
    borrarSesion(){
        localStorage.clear()
    }
    
    actualizar(puntos){
        let puntosActuales = parseInt(localStorage.getItem("maxScore"))
        if(puntos > puntosActuales){
            localStorage.setItem("maxScore",puntos)
        }
    }
    prueba(){
        localStorage.setItem("unsername","jorge")
        localStorage.setItem("maxScore","147852")
    }
}