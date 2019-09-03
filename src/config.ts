require('dotenv').config()

const ADMIN = Object.freeze({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
})

const PORT = process.env.PORT
const MEDIA_PATH = '../public/media'
const PUBLIC_PATH = '../public'

export { ADMIN,  PORT, MEDIA_PATH, PUBLIC_PATH}