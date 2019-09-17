import path from 'path'
require('dotenv').config()

const ADMIN = Object.freeze({
    'username': process.env.ADMIN_USERNAME,
    'password': process.env.ADMIN_PASSWORD
})

const PORT = process.env.PORT

const PUBLIC_FOLDER = '../public'
const MEDIA_FOLDER =  '../public/media'


const MEDIA_PATH = path.join(__dirname, MEDIA_FOLDER)
const PUBLIC_PATH = path.join(__dirname, PUBLIC_FOLDER)

export { ADMIN, PORT, MEDIA_PATH, PUBLIC_PATH }