import { clients } from "../datastore/tables"
import { User, UserProperties as UP } from "../datastore/models"

import { uploader } from "../app"
import { MEDIA_PATH } from "../config";
import { Socket } from 'socket.io'
import path from 'path'

const
    sendToAdmin = (eventName: string, data: object) => {
        try {
            const admin = clients.getAdmin()
            admin.emit(eventName, data)
        } catch { }
    },

    sendUsersToAdmin = () => {
        const data = clients.all().map((row: User) =>
            Object({
                [UP.username]: row.get(UP.username),
                [UP.is_online]: row.get(UP.is_online)
            })
        )

        sendToAdmin('get_users', { 'clients': data })
    },

    userEvent = (actionName: string, user: User) => {
        let data = {
            'username': user.get(UP.username),
            'action': actionName,
        }

        sendToAdmin('user_action', data)
        sendUsersToAdmin()
    },

    initSocketUploader = (socket: Socket) => {
        uploader.listen(socket)

        // TODO: add this to the client
        uploader.on("saved", (event: any) => {
            socket.emit('upload_event', { 'success': true })
        })

        uploader.on("error", (event: any) => {
            socket.emit('upload_event', { 'success': false })
        })
    }


export { sendToAdmin, sendUsersToAdmin, userEvent, initSocketUploader }