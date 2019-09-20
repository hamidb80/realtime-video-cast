import {
    Model, User, Room,
    RoomProperties as RP, UserProperties as UP
} from './models'
import { anyStringVal as Delimiters } from "../utils/util"

class Table<T extends Model> {
    data: Array<T>

    constructor(data = Array<T>()) {
        this.data = [...data]
    }

    insert(row: T) {
        this.data.push(row)
    }

    exist(delimiters: Delimiters) {
        return Boolean(this.find(delimiters).length)
    }

    filter(row: T, delimiters: Delimiters) {
        let haveConditions = true

        for (const property in delimiters) {
            if (row.get(property) != delimiters[property]) {
                haveConditions = false
                break
            }
        }

        return haveConditions
    }

    get(delimiters: Delimiters): T {
        let rows = this.find(delimiters)

        if (rows.length == 0)
            throw Error('There is no row with ' + delimiters)

        return rows[0]
    }

    all() {
        return this.find({})
    }

    find(delimiters: Delimiters) {
        return this.data.filter(row => this.filter(row, delimiters))
    }

    update(delimiters: Delimiters, newData: Delimiters) {
        this.data = this.data.map(row => {

            if (this.filter(row, delimiters)) {
                for (const property in newData) {
                    row.set(property, newData[property])
                }
            }

            return row
        })
    }

    remove(delimiters: Delimiters) {
        this.data = this.data.filter(row => !this.filter(row, delimiters))
    }

    sort(propertyName: string) {
        this.data = this.data.sort((a: T, b: T) => {
            let a_val = a.get(propertyName),
                b_val = b.get(propertyName)

            if (a_val > b_val) return 1
            else if (a_val < b_val) return -1
            else return 0
        })
    }

    clear() {
        this.data = []
    }
}


import { Socket } from "socket.io"
class Clients extends Table<User>{
    getAdmin(): User {
        return this.get({ [UP.username]: 'admin', [UP.is_online]: true })
    }

    getBySocketId(socket_id: string): User {
        return this.get({ [UP.socket_id]: socket_id })
    }

    insertOrUpdate(username:string, socket: Socket) {
        try {
            const client = clients.get({ [UP.username]: username })

            // disconnect the last socket with this username
            const lastSocket = client.data[UP.socket]
            if (lastSocket.connected)
                lastSocket.disconnect()


            client.multiSet({
                [UP.socket]: socket,
                [UP.is_online]: true
            })
            // else create a new user
        } catch {
            clients.insert(new User(
                username, socket, true
            ))
        }
    }
}


const clients = new Clients()
const mainRoom = new Room('room1')

export { Table, clients, mainRoom }