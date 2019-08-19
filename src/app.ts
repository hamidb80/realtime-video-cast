const express = require('express')
const app = express()
const path = require("path")
const siofu = require("socketio-file-upload")

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../public/media')))
app.use(siofu.router)

app.get('/', (req: Request, res: Response) => {
    res.render(path.join(__dirname, '../views/index'))
})

const fs = require('fs')

import { Request, Response } from "express";

// /videos?name=tod for 'today.mp4'
app.get('/videos', (req: Request, res: Response) => {
    let userEnteredName = req.query['name']

    fs.readdir(path.join(__dirname, '../public/media/'), (err: any, fileNames: string[]) => {
        // check sub string
        let matchedNames = fileNames.filter((fileName: string) => fileName.includes(userEnteredName))
        // check not full match
        matchedNames = matchedNames.filter((fileName: string) => fileName !== userEnteredName)
        res.json({ matchedNames })
    })

})

let server = app.listen(2019)
const io = require('socket.io')(server)

// --- admin data ---
require('dotenv').config()

const ADMIN = Object.freeze({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
})

const BROADCAST_ROOM = 'BROADCAST_ROOM'

import { Timer } from './timer'

let store = {
    video_src: '',
    is_play: false,
    is_fullscreen: false,
    timer: new Timer()
}
// the admin should enter username like this: 'username:password'
import { User, UserProperties as UP } from './models'
import { DataStore as DB } from './datastore'

let clients = new DB<User>('username')

function getAdmin(): User | null {
    try {
        return clients.get({ [UP.username]: 'admin', [UP.is_online]: true })
    } catch {
        return null
    }
}

function getClientByConnId(conn_id: number): User | null {
    try {
        return clients.get({ [UP.conn_id]: conn_id })
    } catch {
        return null
    }
}

function sendToAdmin(eventName: string, data: object) {
    let admin = getAdmin()

    if (admin) {
        io.sockets.connected[admin.get('conn_id')].emit(eventName, data)
    } else return false
}

function sendUsersToAdmin() {
    let clientsToSend = clients.find({}).map((row: User) =>
        Object({ 'username': row.get(UP.username), 'is_online': row.get(UP.is_online) })
    )

    sendToAdmin('get_users', { 'clients': clientsToSend })
}

function userEvent(actionName: string, user: User) {
    let data = {
        'username': user.get(UP.username),
        'action': actionName,
    }

    sendToAdmin('user_action', data)
    sendUsersToAdmin()
}

function addClient(username: string, socket: any) {

    if (clients.exist({ [UP.username]: username })) {
        clients.update(
            { [UP.username]: username },
            { [UP.conn_id]: socket.id, [UP.socket]: socket, [UP.is_online]: true }
        )
    } else {
        clients.insert(new User(
            username, socket.id, socket, true
        ))
    }

    socket.join(BROADCAST_ROOM)
}

let uploader = new siofu()
uploader.dir = "public/media/"


io.on('connection', (socket: any) => {
    uploader.listen(socket)

    // make it for admin
    uploader.on("saved", function (event: any) {
        console.log('Hey-----------------------------');
    });

    // Error handler:
    uploader.on("error", function (event: any) {
        console.log("Error from uploader", event);
    });

    socket.on('set_username', (data: { username: string }) => {
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

        }

        // client validation
        else if (username.toLowerCase() != 'admin' && username != '') {
            states.condition = true
        }

        socket.emit('validation', states)

        if (states.condition) {
            addClient(username, socket)

            socket.emit('data', {
                'video_src': store.video_src,
                'is_play': store.is_play,
                'is_fullscreen': store.is_fullscreen,
                'currentTime': store.timer.now(),
            })

            sendUsersToAdmin()
            let client = <User>getClientByConnId(socket.id);
            userEvent('connected', client)
        }

    })

    socket.on('disconnect', () => {
        let client = <User>getClientByConnId(socket.id)

        if (client) {
            clients.update({ [UP.conn_id]: socket.id }, { [UP.is_online]: false })
            userEvent('disconnected', client)
        }
    })


    socket.on('leave', () => {
        let client = <User>getClientByConnId(socket.id)

        if (client) {
            clients.remove({ [UP.conn_id]: socket.id })
            userEvent('left', client)
        }

        socket.emit('can_leave')
    })

    socket.on('set_play', (data: object) => adminRequired(socket, set_play, data))
    socket.on('set_fullscreen', (data: object) => adminRequired(socket, set_fullscreen, data))
    socket.on('set_video_src', (data: object) => adminRequired(socket, set_video_src, data))
    socket.on('set_video_time', (data: object) => adminRequired(socket, set_video_time, data))
})

// --------------------- Admin functions ------------------------
function adminRequired(socket: any, func: Function, data: object) {
    let admin = getAdmin()

    if (admin && socket.id == admin.get(UP.conn_id))
        func(data)
}

const
    set_play = (data: { condition: boolean }) => {
        store.is_play = data.condition
        io.to(BROADCAST_ROOM).emit('change_play', data)

        if (data.condition)
            store.timer.start()
        else
            store.timer.stop()

    },

    set_video_time = (data: { currentTime: number }) => {
        store.timer.set(data.currentTime)
        io.to(BROADCAST_ROOM).emit('change_video_time', data)
    },

    set_fullscreen = (data: { condition: boolean }) => {
        store.is_fullscreen = data.condition
        io.to(BROADCAST_ROOM).emit('change_fullscreen', data)
    },

    set_video_src = (data: { src: string }) => {
        // set new video url
        if (store['video_src'] != data.src) {
            store['video_src'] = data.src
            set_video_time({ 'currentTime': 0 })
            set_play({ 'condition': false })
        }

        io.to(BROADCAST_ROOM).emit('change_video_src', data)
    }