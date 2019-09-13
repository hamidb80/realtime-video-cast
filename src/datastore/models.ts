import { anyStringVal } from "../utils/util"
import { Timer } from "../utils/timer"

class Model {
    data!: anyStringVal
    set(property_name: string, value: any) {
        if (property_name in this.data) {
            this.data[property_name] = value
        }
    }

    multiSet(data: anyStringVal) {
        for (const prop in data)
            this.set(prop, data[prop])
    }

    get(property_name: string) {
        if (property_name in this.data){
            const value = this.data[property_name]
            return typeof value === 'function' ? value() : value
        }


        else throw Error(`the ${property_name} is not defined in the model`)
    }

    asJson(): anyStringVal {
        return this.data
    }
}

import { Socket } from "socket.io"


enum UserProperties {
    username = 'username',
    socket_id = 'socket_id',
    socket = 'socket',
    is_online = 'is_online'
}

const UP = UserProperties

class User extends Model {
    data: {
        [UP.username]: string
        [UP.socket]: Socket
        [UP.socket_id]: () => string
        [UP.is_online]: boolean
    }


    constructor(username: string, socket: Socket, is_online: boolean) {
        super()

        this.data = {
            [UP.username]: username,
            [UP.socket_id]: () => this.data[UP.socket].id,
            [UP.socket]: socket,
            [UP.is_online]: is_online
        }
    }

    reset() {
        this.data[UP.is_online] = false
    }

    emit(eventName: string, data = {}) {
        if (this.data[UP.is_online]) {
            this.data[UP.socket].emit(eventName, data)
        }
        else throw Error('the socket is offline')
    }

}

enum RoomProperties {
    name = 'name',
    videoSrc = 'videoSrc',
    isPlay = 'isPlay',
    isFullscreen = 'isFullscreen',
    timer = 'timer'
}

const RP = RoomProperties

import { io } from "../server"

class Room extends Model {
    data: {
        [RP.name]: string,
        [RP.videoSrc]: string,
        [RP.isFullscreen]: boolean,
        [RP.isPlay]: boolean,
        [RP.timer]: Timer
    }

    constructor(name: string) {
        super()

        this.data = {
            [RP.name]: name,
            [RP.videoSrc]: '',
            [RP.isFullscreen]: false,
            [RP.isPlay]: false,
            [RP.timer]: new Timer()
        }
    }

    emit(eventName: string, data = {}) {
        io.to(this.data[RP.name]).emit(eventName, data)
    }

    addSocket(socket: Socket) {
        socket.join(this.data[RP.name])
    }

    asJson() {
        return {
            'video_src': this.data[RP.videoSrc],
            'is_play': this.data[RP.isPlay],
            'is_fullscreen': this.data[RP.isFullscreen],
            'currentTime': this.data[RP.timer].now()
        }
    }
}


export {
    Model,
    User, UserProperties,
    Room, RoomProperties
}