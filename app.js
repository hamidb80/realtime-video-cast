const express = require('express')
const app = express()
const path = require("path")

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views/index'))
})

const fs = require('fs')

// /videos?name=tod for 'today.mp4'
app.get('/videos', (req, res) => {
    let userEntredName = req.query['name']

    fs.readdir(path.join(__dirname, 'public/'), (err, fileNames) => {
        // check sub string
        matchedNames = fileNames.filter(fileName => fileName.includes(userEntredName))
            // check not full match
        matchedNames = matchedNames.filter(fileName => fileName !== userEntredName)
        res.json({ matchedNames })
    })

})

let server = app.listen(2019)
const io = require('socket.io')(server)

// --- admin data ---
const ADMIN = Object.freeze({
    'username': 'admin',
    'password': 'pass'
})

const Timer = require('./timer')

let store = {
        'video_src': '',
        'is_play': false,
        'is_fullscreen': false,
        'timer': new Timer()
    }
    // the admin should enter username like this: 'username:password'

const User = require('./user-model')

const DB = require('./datastore')
let clients = new DB()


function getAdmin() {
    return clients.get({ username: 'admin', is_online: true })
}

function getClientByConnId(conn_id) {
    return clients.get({ 'conn_id': conn_id })
}

function sendToAdmin(eventName, data) {
    let admin = getAdmin()

    if (admin) {
        io.sockets.connected[admin['conn_id']].emit(eventName, data)
    } else return false
}

function sendUsersToAdmin() {
    let clients_to_send = clients.find().map(row =>
        Object({ 'username': row.username, 'is_online': row.is_online })
    )

    sendToAdmin('get_users', { 'clients': clients_to_send })
}


function userEvent(action, user) {
    let data = {
        'username': user.username,
        'action': action,
    }

    sendToAdmin('user_action', data)
    sendUsersToAdmin()
}


io.on('connection', (socket) => {

    socket.on('set_username', data => {
        let username = data.username.trim()

        let states = {
            'condition': false,
            'is_admin': false
        }

        // admin validation
        if (username.indexOf(':') !== -1) {
            [adminName, adminPass] = username.split(':')

            if (adminName = ADMIN.username && adminPass == ADMIN.password) {
                adminId = socket.id
                username = 'admin'

                states.is_admin = true
                states.condition = true
            }
        }

        // client validation
        else if (username != 'admin' && username != '') {
            states.condition = true
        }

        socket.emit('validation', states)

        if (states.condition) {
            if (clients.exist({ 'username': username })) {

                clients.update({ 'username': username }, { 'conn_id': socket.id, 'socket': socket, 'is_online': true })
            } else {
                clients.insert(new User(
                    username, socket.id, socket, true
                ))

                // sort db
                clients.sortBy('username')
            }

            if (states.is_admin)
                sendUsersToAdmin()


            socket.emit('data', {
                'video_src': store.video_src,
                'is_play': store.is_play,
                'is_fullscreen': store.is_fullscreen,
                'currentTime': store.timer.now(),
            })

            if (states.is_admin == false)
                userEvent('connected', getClientByConnId(socket.id))
        }

    })

    socket.on('disconnect', () => {
        let client = getClientByConnId(socket.id)

        if (client) {
            clients.update({ 'conn_id': socket.id }, { 'is_online': false })
            userEvent('disconnected', client)
        }
    })

    socket.on('leave', () => {
        let client = getClientByConnId(socket.id)

        clients.remove({ 'conn_id': socket.id })
        userEvent('left', client)
    })

    socket.on('set_play', data => adminRequired(socket, set_play, data))
    socket.on('set_fullscreen', data => adminRequired(socket, set_fullscreen, data))
    socket.on('set_video_src', data => adminRequired(socket, set_video_src, data))
    socket.on('set_video_time', data => adminRequired(socket, set_video_time, data))
})

// --------------------- Admin functions ------------------------
function adminRequired(socket, func, data) {
    let admin = getAdmin()

    if (admin && socket.id == admin['conn_id'])
        func(data)
}

const
    set_play = data => {
        store['is_play'] = data.condition
        io.sockets.emit('change_play', data)

        if (data.condition)
            store.timer.start()
        else
            store.timer.stop()

    },

    set_video_time = data => {
        store.timer.set(data.currentTime)
        io.sockets.emit('change_video_time', data)
    },

    set_fullscreen = data => {
        store['is_fullscreen'] = data.condition
        io.sockets.emit('change_fullscreen', data)
    },

    set_video_src = data => {
        // set new video url
        if (store['video_src'] != data.src) {
            store['video_src'] = data.src
            set_video_time({ 'currentTime': 0 })
            set_play({ 'condition': false })
        }

        io.sockets.emit('change_video_src', data)
    }