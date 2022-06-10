'use strict'

require('dotenv').config()

const express = require('express')
const passport = require('passport')
const session = require('express-session')
const passportSocketIo = require('passport.socketio')
const MongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser')
const URI = process.env.MONGO_URI
const store = new MongoStore({ url: URI })

const routes = require('./routes')
const auth = require('./auth')
const myDB = require('./connection')
const fccTesting = require('./freeCodeCamp/fcctesting.js')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)


fccTesting(app) //For FCC testing purposes

app.set('view engine', 'pug')

app.use('/public', express.static(process.cwd() + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

const onAuthorizeSuccess = (data, accept) => {
  console.log("successful connection to socket.io")

  accept(null, true)
}

const onAuthorizeFail = (data, message, error, accept) => {
  if (error)
    throw new Error(message)

  console.log("failed connection to socket.io:", message)

  accept(null, false)
}

io.use(
  passportSocketIo.authorize({
    cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
)

myDB(async client => {
  const myDataBase = await client
    .db('database')
    .collection('users')

  let currentUsers = 0

  io.on('connection', socket => {
    const { name } = socket.request.user
    console.log(`user ${name} connected`)

    io.emit('user', {
      name,
      currentUsers,
      connected: true
    })

    socket.on('disconnect', () => {
      /* anything you want to do on disconnect */
      console.log("Disconnected.")
    })

    socket.on('chat message', data => {
      io.emit('chat message', { name: data.name, message: data.message })
    })
  })

  routes(app, myDataBase)
  auth(app, myDataBase)

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found')
  })
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug/index', {
      title: e,
      message: 'Unable to login'
    })
  })
})


const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})
