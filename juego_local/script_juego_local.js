//Orientado a objetos
const juego = new TresEnRayaJuego();
juego.start();

function TresEnRayaJuego() {
    const tablero = new Tablero();
    const jugador = new Jugador(tablero);
    const jugador_bot = new JugadorOrdenador(tablero);
    let orden = 0;

    this.start = function () {
        //Para saber cáando un jugador ha pulsado
        const config = { childList: true };
        //Cada vez que pase, se cambia de turno
        const observador = new MutationObserver(() => cambiarTurno());

        //Cogemos todas las casillas, para observarlas a cada una
        tablero.casillas.forEach((el) => observador.observe(el, config));
        cambiarTurno();
    }

    function cambiarTurno() {
        if (tablero.ComprobarGanador()) {
            //si hay un ganador salir
            if (orden % 2 === 0) {
                //ha ganado el jugador
                alert("Te ha ganado un maquina...");
            } else {
                //Ha ganado la máquina
                alert("Has ganado...");
            }

            return;
        }
        if (orden % 2 === 0) {
            jugador.cambiarTurno();
        } else {
            jugador_bot.cambiarTurno();
        }
        orden++;
    };
}
function Tablero() {
    //almacenamos todas las casillas
    this.casillas = Array.from(document.querySelectorAll('.casilla'));
    console.log(this.casillas);

    //comprobarGanador
    /*Combinaciones posibles
        1   2   3
        4   5   6
        7   8   9
    */
    this.ComprobarGanador = function () {
        let ganador = false;
        const combinacionesPosibles = [
            //Horizontal
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            //Vertical
            [0, 4, 8],
            [2, 4, 6],
            [0, 3, 6],
            //Diagonal
            [1, 4, 7],
            [2, 5, 8]
        ];

        const casillas = this.casillas;
        combinacionesPosibles.forEach((combos) => {
            const casilla1InnerText = casillas[combos[0]].innerText;
            const casilla2InnerText = casillas[combos[1]].innerText;
            const casilla3InnerText = casillas[combos[2]].innerText;
            //Será ganador cuando lacasilla sea distinto de null y
            // c1 === c2 && c2 === c3
            const esGanador = casilla1InnerText !== '' &&
                casilla1InnerText === casilla2InnerText &&
                casilla2InnerText === casilla3InnerText;

            //Añadimos una clase a las casillas del ganador para destacarlas cuando se gane.
            if (esGanador) {
                ganador = true;
                combos.forEach((index) => {
                    casillas[index].className += ' ganador';
                })
            }
        });
        return ganador;
    }
}

function Jugador(tablero) {
    this.cambiarTurno = function () {
        //Cada vez que nos toca podemos añadir una X
        //para cada casilla de la tabla añadimos un EventListener que nos permitira dibujarla x
        tablero.casillas.forEach(el => el.addEventListener('click', dibujar));
    }

    /*
    *'@param' la casilla pulsada; 
    */
    function dibujar(event) {
        event.target.innerText = 'X';
        //Una vez pulsado desvinculamos la casilla al EventListener
        tablero.casillas.forEach(el => el.removeEventListener('click', dibujar));
    }
}

function JugadorOrdenador(tablero) {
    this.cambiarTurno = function () {
        //necesitamos saber las casillas libres
        const casillasLibres = tablero.casillas.filter((p) => p.innerText === '');

        //random para que el ordenador dibuje
        const rand = Math.floor(Math.random() * casillasLibres.length);
        casillasLibres[rand].innerText = 'O';
    }
}






