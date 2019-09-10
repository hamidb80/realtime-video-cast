import express from "express"
import { router } from "./routes"

import SocketIO from "socket.io"
import { Socket } from "socket.io"
import { socketInit } from "./socket/wrapper"

import { PORT, PUBLIC_PATH, MEDIA_PATH } from "./config"
import path from "path"


const siofu = require('socketio-file-upload')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, PUBLIC_PATH)))

app.use('/', router)

const uploader = new siofu()
uploader.dir = path.join(__dirname, MEDIA_PATH)

app.use(siofu.router)

const server = app.listen(PORT)
const io = SocketIO(server)

// remove limit of sockets
io.sockets.setMaxListeners(0)

io.on('connection', (socket: Socket) => socketInit(socket))

export { io, uploader }