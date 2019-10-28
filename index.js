const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

var wsServer = null;
var clients = [];

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

    db.exec(initQuery, function(err, stmt) {

    });

    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  });
}

function Jugador(nombre, maxScore, avatar, position) {
  this.nombre = nombre;
  this.maxScore = maxScore;
  this.lastPing = new Date();
  this.avatar = avatar;
  this.position = position
}

function initWsServer() {
  wsServer = new WebSocket.Server({ port: 4741 });

  wsServer.on('connection', function (ws, req) {

    ws.on('message', message => {
      let msg = JSON.parse(message);

      if (msg.type) {
        switch (msg.type) {
          case "userData":
            let cliente = {
              nombre: msg.data.nombre,
              nivel: msg.data.nivel,
              ip: req.connection.remoteAddress
            };

            clients.push(cliente);

            console.log("New user: " + cliente.nombre);

            let dataSend = {
              type: "clients",
              data: clients
            };

            ws.send(JSON.stringify(dataSend));

            break;
          case "ping":

        }
      }
    });
  });
}

app.get('/', function (req, res) {
  res.sendFile('./views/index.html', { root: __dirname });
});

app.post('/getView', function (req, res) {
  console.log(req.body);
  ``````````````````````
  res.sendFile(`./views/${req.body.pagina}`, { root: __dirname });
});

app.post('/login', function (req, res) {
  let dataSend = {
    username: "",
    loginState: false,
    maxScore: 0,
    hash: "prueba"
  };

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

  let insertSignUp = `
    INSERT INTO usuarios (username, passwd) VALUES (?, ?)
  `.trim();
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

initUsersDb();
initWsServer();

app.listen(4740, function () {
  console.log('Aplicación ejemplo, escuchando el puerto 4740!');
});