//Clase que controlará el usuario en el localStorage 
class SesionUsuario {
	constructor() {

	}
	//Se obtiene el hash del usuario en el localStorage
	getUsuarioLocal() {
		let usuarioStorage = {}
		usuarioStorage.hash = localStorage.getItem("jugadorHash");

		return JSON.stringify(usuarioStorage);
	}

	//Guarda el hash del usuario en el localStorage 
	guardarUsuario(hash) {
		localStorage.setItem("jugadorHash", hash);
	}
	//Borra el localStorage
	borrarSesion() {
		localStorage.clear()
	}
}