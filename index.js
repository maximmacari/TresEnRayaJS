const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

var wsServer = null;

var salas = [];
var clientes = [];

//Creación de MiddleWare, que tiene acceso a las solicitudes(request) y las respuestas(response) de la aplicación.
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


//BBDD usuario
function initUsersDb() {

  //Busca la BBDD si no la encuentra la crea, en caso contrario imprimira el error.
  let db = new sqlite3.Database('./db/usuarios.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }

    //definición tabla usuario
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

<<<<<<< HEAD
//Funcion para crear el lienzo del juego
function generarTablero(sala){
=======
function updateTableros() {

}

function generarTablero(sala) {
>>>>>>> 9acd833bf600014944a8fa9b20da0aeaaf7b6eb8
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
        value: "none"
      };

      filaCasillas.push(casilla);
    }

    sala.tablero.push(filaCasillas);
  }
}



function initWsServer() {
  wsServer = new WebSocket.Server({ port: 4741 });

  wsServer.on('connection', function (ws, req) {

    ws.on('message', message => {
      let msg = JSON.parse(message);

      if (msg.type) {
        if (msg.type === "userData") {
          let cliente = {
            username: msg.data.username,
            ip: req.connection.remoteAddress,
            ws: ws
          };

          clientes.push(cliente);

          console.log("New user: " + cliente.username);

          let dataSend = {
            type: "clients",
            data: clientes
          };

          ws.send(JSON.stringify(dataSend));
        }else if(msg.type === "getTablero"){
          let dataSend = {
            type: "tablero",
            data: {
              tablero: []
            }
          };
          
          for(let sala of salas){
            if(sala.nombre === msg.data.nombreSala){
              dataSend.data.tablero = sala.tablero;
            }
          }

          ws.send(JSON.stringify(dataSend));
        }else if(msg.type === "celdaClick"){
          let position = msg.data.position;

          for(let sala of salas){
            if(sala.nombre === msg.data.nombreSala){
              sala.tablero[position.y][position.x].value = "cruz";
            }
          }
        }
      }
    });
  });
}

//te envia a la página principal
app.get('/', function (req, res) {
  res.sendFile('./views/index.html', { root: __dirname });
});

//recibe un objeto json que es el usuario
app.post('/getView', function (req, res) {
  console.log(req.body);
  res.sendFile(`./views/${req.body.pagina}`, { root: __dirname });
});

app.post('/login', function (req, res) {
  let dataSend = {
    username: "",
    loginState: false,
    maxScore: 0,
    hash: "prueba"
  };

  //buscar la BBDD de usuario
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
      dataSend.loginState = true;
      dataSend.maxScore = row.maxScore;
      dataSend.username = row.username;
    } else {
      dataSend.loginState = false;
    }

    console.log(dataSend);

    res.send(JSON.stringify(dataSend));

    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
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

  //var query insertar usuario
  let insertSignUp = `
    INSERT INTO usuarios (username, passwd) VALUES (?, ?)
  `.trim();
  //var query seleccionar usuario de BBD para el login
  let queryLogin = `
    SELECT * FROM usuarios WHERE
    username = ? AND passwd = ?
  `.trim();

  let username = req.body.username;
  let passwd = req.body.pass;
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

app.post("/crearSala", function(req, res){
  let dataSend = {
    type: "crearSala",
    result: false,
    msg: ""
  };

  try{
    let sala = {
      nombre: req.body.nombreSala,
      clave: req.body.claveSala,
      creador: req.body.jugador,
      jugadores: [null, null],
      tablero: []
    };
  
    generarTablero(sala);
  
    salas.push(sala);
    
    dataSend.result = true;
    dataSend.msg = "Sala [" + sala.nombre + "] creada!";
  }catch(err){
    dataSend.result = false;
    dataSend.msg = "Sala no creada";
  }
  
  res.send(JSON.stringify(dataSend));
});

app.post("/entrarSala", function(req, res){
  let dataSend = {
    type: "entrarSala",
    result: false,
    msg: ""
  }

  let salaEncontrada = false;

  for (let sala of salas) {
    if (sala.nombre === req.body.nombreSala) {
      let libre = false;

      salaEncontrada = true;

      if (sala.clave === req.body.claveSala) {
        for (let i = 0; i < sala.jugadores.length; i++) {
          if (sala.jugadores[i] !== null) {
            libre = true;

            salas.jugadores = req.body.jugador;
          }
        }

        if (libre) {
          dataSend.result = false;
          dataSend.msg = "Sala llena"
        } else {
          dataSend.result = true;
          dataSend.msg = "Has entrado a la sala"
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

app.get("/listSalas", function(req, res){
  res.send(JSON.stringify(salas));
});

initUsersDb();
initWsServer();

app.listen(4740, function () {
  console.log('Aplicación ejemplo, escuchando el puerto 4740!');
});