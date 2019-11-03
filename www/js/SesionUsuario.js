class SesionUsuario {
	constructor() {

	}
	
	getUsuarioLocal() {
		let usuarioStorage = {}
		usuarioStorage.hash = localStorage.getItem("jugadorHash");

		return JSON.stringify(usuarioStorage);
	}

	guardarUsuario(hash) {
		localStorage.setItem("jugadorHash", hash);
	}

	borrarSesion() {
		localStorage.clear()
	}
}