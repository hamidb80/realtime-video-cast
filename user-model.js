class User {

    constructor(username, conn_id = null, socket = null, is_online = false) {
        this.username = username
        this.conn_id = conn_id
        this.socket = socket
        this.is_online = is_online
    }

    reset(){
        this.conn_id = null
        this.socket = null
        this.is_online = null
    }

}

module.exports = User