import { clients } from "../datastore/tables"
import { User, UserProperties as UP } from "../datastore/models"

import { uploader } from "../app"
import { Socket } from 'socket.io'

const
    sendToAdmin = (eventName: string, data: object) => {
        try {
            const admin = clients.getAdmin()
            admin.emit(eventName, data)
        } catch { }
    },

    sendUsersToAdmin = () => {
        clients.sort(UP.username)

        const data = clients.all().map((row: User) =>
            Object({
                [UP.username]: row.get(UP.username),
                [UP.is_online]: row.get(UP.is_online)
            })
        )

        sendToAdmin('get_users', { 'clients': data })
    },

    userEventEcho = (actionName: string, user: User) => {
        let data = {
            'username': user.get(UP.username),
            'action': actionName,
        }

        sendToAdmin('user_action', data)
        sendUsersToAdmin()
    },

    initSocketUploader = (socket: Socket) => {
        uploader.listen(socket)

        uploader.on("saved", (event: any) => {
            socket.emit('upload_event', { 'success': true })
        })

        uploader.on("error", (event: any) => {
            socket.emit('upload_event', { 'success': false })
        })
    }


export { sendToAdmin, sendUsersToAdmin, userEventEcho, initSocketUploader }