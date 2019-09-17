import { Socket } from "socket.io";

const login = (socket: Socket, username: string) => {
    socket.emit('login', { 'username': username })
}

export {
    login
}