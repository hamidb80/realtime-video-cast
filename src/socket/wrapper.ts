import { Socket } from "socket.io"
import {
    login, disconnect, leave,
    setFullscreen, setPlay, setVideoSrc, setVideoTime
} from "./actions"

import { clients } from "../datastore/tables"
import { UserProperties as UP } from "../datastore/models"

function adminRequired(socket: Socket, func: (data: any) => void, data: any) {
    try {
        const admin = clients.getAdmin()

        if (socket.id == admin.get(UP.socket_id))
            func(data)

    } catch { }
}

function socketInit(socket: Socket) {
    // user actions
    socket.on('login', (data: { username: string }) => login(socket, data))
    socket.on('disconnect', () => disconnect(socket))
    socket.on('leave', () => leave(socket))

    // admin actions
    socket.on('set_play', (data: object) => adminRequired(socket, setPlay, data))
    socket.on('set_fullscreen', (data: object) => adminRequired(socket, setFullscreen, data))
    socket.on('set_video_src', (data: object) => adminRequired(socket, setVideoSrc, data))
    socket.on('set_video_time', (data: object) => adminRequired(socket, setVideoTime, data))
}


export { socketInit }