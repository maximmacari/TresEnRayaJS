class SesionUsuario {
    constructor (){

    }
    getUsuarioLocal(){
        let usuarioStorage = {}
        usuarioStorage.username = localStorage.getItem("username")
        usuarioStorage.maxScore = localStorage.getItem("maxScore")

        return JSON.stringify(usuarioStorage);
    }
    guardarUsuario(usuarioSesion, score){
        localStorage.setItem("username",usuarioSesion.username);
        localStorage.setItem("password",usuarioSesion.password)
        localStorage.setItem("maxScore",score);
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