'use strict'

require('dotenv').config()

const express = require('express')
const passport = require('passport')
const session = require('express-session')

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


myDB(async client => {
  const myDataBase = await client
    .db('database')
    .collection('users')

  let currentUsers

  io.on('connection', socket => {
    ++currentUsers
    console.log('A user has connected')
  })

  io.emit('disconnect')

  io.emit('user count', currentUsers)

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
