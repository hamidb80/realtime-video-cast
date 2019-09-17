import express from "express"
import { router } from "./routes"

import { Socket } from "socket.io"
import { socketInit } from "./socket/wrapper"

import { PUBLIC_PATH, MEDIA_PATH } from "./config"

import { website, io } from "./server"

const siofu = require('socketio-file-upload')

// init socket uploader
const uploader = new siofu()
uploader.dir = MEDIA_PATH
website.use(siofu.router)

// config express website
website.set('view engine', 'ejs') // view engine
website.use(express.static(PUBLIC_PATH)) // set static files
website.use('/', router) // add routes

// init socket io
// remove limit of sockets
io.sockets.setMaxListeners(0)
io.on('connection', (socket: Socket) => socketInit(socket))

export { uploader }