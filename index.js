//Se exportan unos modulos que se usarán en el servidor
const express = require('express');
const hbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const tools = require('./tools.js');
const os = require('os');
const open = require('open');
//Es el web socket server
var wsServer = null;

var salas = [];
var clientes = [];
var intervalPing = null;
var ifaces = os.networkInterfaces();

//Se estable un motor de templates que es el Handlebars
app.set('view engine', 'hbs');
//Se estable los directorios donde estaran las plantillas
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultView: 'index',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

//En todos los use se configurará el middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('./www'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

//Se crea un objeto cliente que representará al usuario
function Cliente(id, username, hash, maxScore) {
  this.ws = null;
  this.id = id;
  this.username = username;
  this.hash = hash;
  this.maxScore = maxScore;
  this.ping = new Date().getTime();
}

//Function que representará una sala donde dos jugadores podrán meterse para jugar online
function Sala(nombreSala, claveSala, jugador) {
  this.nombre = nombreSala;
  this.clave = claveSala;
  this.creador = jugador;
  this.jugadores = [null, null];
  this.tablero = [];
  this.turno = 0;
}

//Envia el tablero al cliente
function enviarTablero(ws, nombreSala) {
  let dataSend = {
    type: "tablero",
    data: {
      tablero: []
    }
  };

  for (let sala of salas) {
    if (sala.nombre === nombreSala) {
      dataSend.data.tablero = sala.tablero;
    }
  }

  ws.send(JSON.stringify(dataSend));
}

//Busca si el cliente que ha iniciado sesión ya existe y lo devuelve en pudiendo ser null o el cliente encontrado
function searchCliente(hash) {
  let cliente = null;
  for (let clienteAux of clientes) {
    if (clienteAux.hash === hash) {
      cliente = clienteAux;
    }
  }

  return cliente;
}

//Crea la tabla de usuarios en la base de datos si no existe
function initUsersDb() {
  let db = new sqlite3.Database('./db/usuarios.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }

    let initQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) NOT NULL,
      passwd VARCHAR(1024) NOT NULL,
      maxScore DEFAULT 0
    );
    `.trim();

    db.exec(initQuery, function (err, stmt) {

    });

    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });  
}

//Genera el tablero que verán los usuarios al jugar en online
function generarTablero(sala) {
  let nCasillas = [3, 3];

  this.casillas = [];

  for (let i = 0; i < nCasillas[1]; i++) {
    let filaCasillas = [];

    for (let k = 0; k < nCasillas[0]; k++) {
      let casilla = {
        position: {
          x: k,
          y: i
        },
        value: "none" // "circulo" | "cruz" | "none"
      };

      filaCasillas.push(casilla);
    }

    sala.tablero.push(filaCasillas);
  }
}

//Se comprueba las posibles jugadas ganadoras
function comprobarGanador(tablero, jugadorID) {
  //tablero[0][0].value -> "cruz", "circulo", "none" [y, x]
  if (tablero[0][0].value == tablero[0][1] && tablero[0][1].value == tablero[0][2] && tablero[0][0].value != 0) return tablero[0][0];
  if (tablero[1][0].value == tablero[1][1] && tablero[1][1].value == tablero[1][2] && tablero[1][0].value != 0) return tablero[1][0];
  if (tablero[2][0].value == tablero[2][1] && tablero[2][1].value == tablero[2][2] && tablero[2][0].value != 0) return tablero[2][0];
  //Las líneas verticales
  if (tablero[0][0].value == tablero[1][0] && tablero[1][0].value == tablero[2][0] && tablero[0][0].value != 0) return tablero[0][0];
  if (tablero[0][1].value == tablero[1][1] && tablero[1][1].value == tablero[2][1] && tablero[0][1].value != 0) return tablero[0][1];
  if (tablero[0][2].value == tablero[1][2] && tablero[1][2].value == tablero[2][2] && tablero[0][2].value != 0) return tablero[0][2];
  //Las diagonales
  if (tablero[0][0].value == tablero[1][1] && tablero[1][1].value == tablero[2][2] && tablero[0][0].value != 0) return tablero[0][0];
  if (tablero[2][0].value == tablero[1][1] && tablero[1][1].value == tablero[0][2] && tablero[2][0].value != 0) return tablero[2][0];
}

//Función que inicializará el web socket server
function initWsServer() {
  wsServer = new WebSocket.Server({ port: 4741 });

  wsServer.on('connection', function (ws, req) {
    ws.isAlive = true;

    ws.on("close", function(code, reason){
      console.log("Código: " + code + "\nReason: " + reason);
    });

    ws.on('message', message => {
      let msg = JSON.parse(message);

      if (msg.type === "registrarJugador") {
        let dataSend = {
          type: "registrarJugador",
          data: {
            result: false
          }
        };
        let registrado = false;

        for (let i = 0; i < clientes.length; i++) {
          if (clientes[i].hash === msg.data.jugadorHash) {
            clientes[i].ws = ws;

            registrado = true;
          }
        }

        dataSend.data.result = registrado;

        ws.send(JSON.stringify(dataSend));
      } else if (msg.type === "getTablero") {
        enviarTablero(ws, msg.data.nombreSala);
      } else if (msg.type === "celdaClick") {
        let position = msg.data.position;
        let sala = null;

        for (let salaAux of salas) {
          if (salaAux.nombre === msg.data.nombreSala) {
            sala = salaAux;
          }
        }

        if (sala !== null) {
          let ficha = "none";
          let jugador = null;
          let jugadorId = null;

          for (let j = 0; j < sala.jugadores.length; j++) {
            if (sala.jugadores[j] === msg.data.jugadorHash) {
              jugador = sala.jugadores[j];
              jugadorId = j;
            }
          }

          if (sala.turno === jugadorId) {
            if (jugadorId === 0) {
              ficha = "cruz";
              sala.turno = 1;
            } else if (jugadorId === 1) {
              ficha = "circulo";
              sala.turno = 0;
            }

            sala.tablero[position.y][position.x].value = ficha;
          }

          for (let jugadorAux of sala.jugadores) {
            if (jugadorAux !== null) {
              let jugador = searchCliente(jugadorAux);

              if (jugador !== null) {
                enviarTablero(jugador.ws, sala.nombre);
              }
            }
          }
        }
      } else if (msg.type === "infoSala") {
        let sala = null;
        let dataSend = {
          nombreSala: "",
          jugadores: []
        };

        for (let salaAux of salas) {
          if (salaAux.nombre === msg.data.nombreSala) {
            sala = salaAux;
          }
        }

        if (sala !== null) {

        }
      }
    });
  });
}

//Cada tres segundos se comprueba si los clientes registrados están online
// intervalPing = setInterval(function ping() {
//   for(let cliente of clientes){
//     if(cliente.ws !== null){
//       if (cliente.ws.isAlive === false) {
//         cliente.ws.terminate();
  
//         console.log("Cliente desconectado: " + cliente.hash);
  
//         break;
//       }
  
//       cliente.ws.isAlive = false;
//       cliente.ws.ping(function(){});
//     }
//   }
// }, 3000);

//Se define la ruta a la que se hará un get
app.get('/', function (req, res) {
  res.render('index', { layout: 'main' });
});

//Se define metodo post, ruta y callback
app.post('/getView', function (req, res) {
  res.sendFile(`./views/${req.body.pagina}`, { root: __dirname });
});

//Se define el metodo post y su ruta y el objeto que recibirá que será un usuario junto a un callback
app.post('/login', function (req, res) {
  let dataSend = {
    username: "",
    loginState: false,
    maxScore: 0,
    hash: ""
  };

  if (req.body.hash) {
    let usuarioRecuperado = null;

    for (let cliente of clientes) {
      if (cliente.hash === req.body.hash) {
        usuarioRecuperado = cliente;
      }
    }

    if (usuarioRecuperado !== null) {
      dataSend.loginState = true;
      dataSend.username = usuarioRecuperado.username;
      dataSend.maxScore = usuarioRecuperado.maxScore;
      dataSend.hash = usuarioRecuperado.hash;
    } else {
      dataSend.loginState = false;
    }

    res.send(JSON.stringify(dataSend));
  } else {
    let db = new sqlite3.Database('./db/usuarios.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(err.message);
      }
    });

    let queryLogin = `
      SELECT * FROM usuarios WHERE
      username = ? AND passwd = ?
    `.trim();

    let username = req.body.username;
    let passwd = req.body.password;

    db.get(queryLogin, [username, passwd], function (err, row) {
      if (err) {
        console.log(err);
      }

      if (row) {
        let hash = tools.randomString(12);

        dataSend.loginState = true;
        dataSend.maxScore = row.maxScore;
        dataSend.username = row.username;
        dataSend.hash = hash;

        let clienteExistente = false;

        for (let cliente of clientes) {
          if (cliente.id === row.id) {
            clienteExistente = true;

            cliente.hash = hash;
          }
        }

        if (!clienteExistente) {
          clientes.push(new Cliente(row.id, row.username, hash, row.maxScore));
        }
      } else {
        dataSend.loginState = false;
      }

      res.send(JSON.stringify(dataSend));

      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    });
  }
});

app.post('/signup', function (req, res) {
  let dataSend = {
    signUpState: false,
    msg: ""
  };

  let db = new sqlite3.Database('./db/usuarios.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  let insertSignUp = `
    INSERT INTO usuarios (username, passwd) VALUES (?, ?)
  `.trim();
  let queryLogin = `
    SELECT * FROM usuarios WHERE
    username = ? AND passwd = ?
  `.trim();

  let username = req.body.username;
  let passwd = req.body.password;
  let exists = false;

  db.get(queryLogin, [username, passwd], function (err, row) {
    if (err) {
      console.log(err);
    }

    if (row) {
      exists = true;
    } else {
      exists = false;
    }

    if (!exists) {
      db.get(insertSignUp, [username, passwd], function (err, row) {
        if (err) {
          console.log(err);
        } else {
          console.log("OK SIGNUP");

          dataSend.signUpState = true;
          dataSend.msg = "OK";

          res.send(JSON.stringify(dataSend));
        }
      });
    } else {
      dataSend.signUpState = false;
      dataSend.msg = "EXISTS";

      res.send(JSON.stringify(dataSend));
    }
  });
});

//método post, ruta y callback que creará una sala
app.post("/crearSala", function (req, res) {
  let dataSend = {
    type: "crearSala",
    result: false,
    msg: ""
  };

  try {
    let existe = false;

    for (let sala of salas) {
      if (sala.nombre === req.body.nombreSala) {
        existe = true;
      }
    }

    if (!existe) {
      let sala = new Sala(req.body.nombreSala,
        req.body.claveSala, req.body.jugador);

      generarTablero(sala);

      salas.push(sala);

      dataSend.result = true;
      dataSend.msg = "Sala [" + sala.nombre + "] creada!";
    } else {
      dataSend.result = false;
      dataSend.msg = "La sala [" + sala.nombre + "] ya existe, no creada";
    }
  } catch (err) {
    dataSend.result = false;
    dataSend.msg = "Sala no creada";

    console.error(err);
  }

  res.send(JSON.stringify(dataSend));
});

//método post, ruta y callback que sirve para entrar a una sala recibiendo datos del usuario
app.post("/entrarSala", function (req, res) {
  let dataSend = {
    type: "entrarSala",
    result: false,
    msg: ""
  }

  let salaEncontrada = false;

  for (let i = 0; i < salas.length; i++) {
    if (salas[i].nombre === req.body.nombreSala) {
      let libre = false;

      salaEncontrada = true;

      if (salas[i].clave === req.body.claveSala) {
        for (let k = 0; k < salas[i].jugadores.length && !libre; k++) {
          if (salas[i].jugadores[k] === null) {
            libre = true;

            salas[i].jugadores[k] = req.body.jugadorHash;
          }
        }

        if (libre) {
          dataSend.result = true;
          dataSend.msg = "Has entrado a la sala";
        } else {
          dataSend.result = false;
          dataSend.msg = "Sala llena";
        }
      } else {
        dataSend.result = false;
        dataSend.msg = "Clave incorrecta";
      }
    }
  }

  if (!salaEncontrada) {
    dataSend.result = false;
    dataSend.msg = "Sala no encontrada";
  }

  res.send(JSON.stringify(dataSend));
});

app.get("/listSalas", function (req, res) {
  res.send(JSON.stringify(salas));
});

initUsersDb();
initWsServer();

//Se ejecuta el servidor para que los jugadores puedan entrar a la página
app.listen(4740, function () {
  console.log('TresEnRaya, escuchando en el puerto 4740!');
  
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }

      console.log("IP Local (Para que se conecten otros equipos): http://" + iface.address + ":4740");

      ++alias;
    });
  });

  open('http://localhost:4740/', {app: ['chrome']});
});