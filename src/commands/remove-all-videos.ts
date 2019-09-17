import { MEDIA_PATH } from "../config"
import path from "path"
import fs from "fs"

fs.readdir(MEDIA_PATH, (err, files) => {
    if (err) throw err

    for (const file of files) {
        fs.unlink(path.join(MEDIA_PATH, file), (err) => {
            if (err) throw err
        })
    }
})

