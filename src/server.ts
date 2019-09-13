import SocketIO from "socket.io"
import express from "express"
import { PORT } from "./config"

const app = express()

const server = app.listen(PORT)
const io = SocketIO(server)

export {
    app, io
}