import { anyStringVal } from "./utils";


export enum UserProperties {
    username = 'username',
    conn_id = 'conn_id',
    socket = 'socket',
    is_online = 'is_online'
}

export class Model {
    data!: anyStringVal;

    set(property_name: string, value: any) {
        if (property_name in this.data) {
            this.data[property_name] = value
        }
    }

    get(property_name: string) {
        if (property_name in this.data)
            return this.data[property_name]

        else throw Error(`the ${property_name} is not defined in the model`)
    }

    asJson(): anyStringVal {
        return this.data
    }
}

export class User extends Model {
    data: {
        [UserProperties.username]: string;
        [UserProperties.conn_id]: number;
        [UserProperties.socket]: any;
        [UserProperties.is_online]: boolean;
    }

    constructor(username: string, conn_id = 0, socket = null, is_online = false) {
        super()

        this.data = {
            'username': username,
            'conn_id': conn_id,
            'socket': socket,
            'is_online': is_online
        }
    }

    reset() {
        this.data['conn_id'] = 0
        this.data['socket'] = null
        this.data['is_online'] = false
    }

}

