require('dotenv-safe').config()

var jwt = require('jsonwebtoken')
var http = require('http')
const express = require('express')
const app = express()
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
const { json } = require('body-parser')


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())


function verifyJWT(req, res, next){
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, process.env.SECRET, function(err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    
    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}

app.get('/', (req, res, next) => {
  res.json( { message: "tudo ok por aqui!"})
})

app.get('/clientes',verifyJWT, (req, res, next) => {
  console.log("Retornou todos os clientes!")
  res.json([{id: 1, nome: 'Luiz'}])
})

app.post('/login', (req, res, next) => {
  if (req.body.user === 'luiz' && req.body.pwd === '123') {
    //auth ok
    const id = 1
    var token = jwt.sign({ id }, process.env.SECRET, {
      expiresIn: 300 //expires em 5 min
    })
    return res.json({ auth: true, token: token})
  }
  res.status(500).json({message: 'login invalid'})
})

app.post('/logout', (req, res) => {
  res.json({ auth: false, token: null })
})


var server = http.createServer(app)
server.listen(3000)
console.log("Servidor escutando na porta 3000...")