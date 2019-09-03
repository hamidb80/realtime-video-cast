import { clients, mainRoom as room } from "../datastore/tables"
import { RoomProperties as RP, UserProperties as UP } from "../datastore/models"
import { Socket } from 'socket.io'
import { ADMIN } from "../config"


import {
    sendUsersToAdmin, userEvent,
    initSocketUploader
} from "./functions"

// user actions
const
    login = (socket: Socket, data: { username: string }) => {
        let username: string = data.username.trim()

        let states = {
            condition: false,
            is_admin: false
        }

        // admin validation
        if (username == `${ADMIN.username}:${ADMIN.password}`) {
            username = 'admin'

            states.is_admin = true
            states.condition = true

            initSocketUploader(socket)
        }

        // client validation
        else if (username.toLowerCase() != 'admin' && username != '')
            states.condition = true


        socket.emit('validation', states)

        if (states.condition) {
            clients.insertOrUpdate(username, socket)

            room.addSocket(socket)
            socket.emit('data', room.asJson())

            const client = clients.getBySocketId(socket.id)
            userEvent('connected', client)
            sendUsersToAdmin()
        }
    },

    disconnect = (socket: Socket) => {
        try {
            let client = clients.getBySocketId(socket.id)

            clients.update({ [UP.socket_id]: socket.id }, { [UP.is_online]: false })
            userEvent('disconnected', client)

        } catch  { }
    },
    leave = (socket: Socket) => {
        try {
            const client = clients.getBySocketId(socket.id)

            clients.remove({ [UP.socket_id]: socket.id })
            userEvent('left', client)

            socket.emit('can_leave')
        } catch  { }
    }

// admin actions
const
    setPlay = (data: { condition: boolean }) => {
        room.set(RP.isPlay, data.condition)

        let roomName = room.get(RP.name)

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
