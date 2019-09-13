import express from "express"
import { router } from "./routes"

import { Socket } from "socket.io"
import { socketInit } from "./socket/wrapper"

import { PUBLIC_PATH, MEDIA_PATH } from "./config"
import path from "path"

import { app, io } from "./server"

const siofu = require('socketio-file-upload')

// init socket uploader
const uploader = new siofu()
uploader.dir = path.join(__dirname, MEDIA_PATH)
app.use(siofu.router)

// config express app
app.set('view engine', 'ejs')

// set static files
app.use(express.static(path.join(__dirname, PUBLIC_PATH)))

// add routes
app.use('/', router)

// init socket io
// remove limit of sockets
io.sockets.setMaxListeners(0)

io.on('connection', (socket: Socket) => socketInit(socket))

export { uploader }