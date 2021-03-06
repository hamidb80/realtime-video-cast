import { clients, mainRoom as room } from "../datastore/tables"
import { RoomProperties as RP, UserProperties as UP } from "../datastore/models"
import { Socket } from 'socket.io'
import { ADMIN } from "../config"


import {
    sendUsersToAdmin, userEventEcho,
    initSocketUploader
} from "./functions"

// user actions
const
    login = (socket: Socket, data: { username: string }) => {
        let username: string = data.username.trim()

        let loginStates = {
            condition: false,
            is_admin: false
        }

        // admin validation
        if (username == `${ADMIN.username}:${ADMIN.password}`) {
            username = 'admin'

            loginStates.is_admin = true
            loginStates.condition = true

            initSocketUploader(socket)
        }

        // client validation
        else if (username.toLowerCase() != 'admin' && username != '')
            loginStates.condition = true


        socket.emit('validation', loginStates)

        if (loginStates.condition) {
            // update if this username exists
            clients.insertOrUpdate(username, socket)

            room.addSocket(socket)
            socket.emit('data', room.asJson())

            const client = clients.getBySocketId(socket.id)
            userEventEcho('connected', client)
            sendUsersToAdmin()
        }
    },

    disconnect = (socket: Socket) => {
        try {
            let client = clients.getBySocketId(socket.id)

            clients.update({ [UP.socket_id]: socket.id }, { [UP.is_online]: false })
            userEventEcho('disconnected', client)

            room.removeSocket(socket)
        } catch  { }
    },
    leave = (socket: Socket) => {
        try {
            const client = clients.getBySocketId(socket.id)

            clients.remove({ [UP.socket_id]: socket.id })
            userEventEcho('left', client)

            socket.emit('can_leave')
        } catch  { }
    }

// admin actions
const
    setPlay = (data: { condition: boolean }) => {
        room.set(RP.isPlay, data.condition)
        room.emit('change_play', data)

        if (data.condition)
            room.data[RP.timer].start()
        else
            room.data[RP.timer].stop()

    },

    setVideoTime = (data: { currentTime: number }) => {
        room.data[RP.timer].setTime(data.currentTime)
        room.emit('change_video_time', data)
    },

    setFullscreen = (data: { condition: boolean }) => {
        room.set(RP.isFullscreen, data.condition)
        room.emit('change_fullscreen', data)
    },

    setVideoSrc = (data: { src: string }) => {
        // set new video url
        if (room.get(RP.videoSrc) != data.src) {
            room.set(RP.videoSrc, data.src)

            setVideoTime({ 'currentTime': 0 })
            setPlay({ 'condition': false })
        }

        room.emit('change_video_src', data)
    }


export {
    login, disconnect, leave,
    setPlay, setVideoTime, setFullscreen, setVideoSrc
}
