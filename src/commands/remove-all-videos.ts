import { MEDIA_PATH } from "../config"
import path from "path"
import fs from "fs"

const videoFolder = path.join(__dirname, '../', MEDIA_PATH)

fs.readdir(videoFolder, (err, files) => {
    if (err) throw err

    for (const file of files) {
        fs.unlink(path.join(videoFolder, file), (err) => {
            if (err) throw err
        })
    }
})

