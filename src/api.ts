import { Request, Response } from "express"
import { MEDIA_PATH } from "./config"
import path from "path"
import fs from "fs"

function homePage(req: Request, res: Response) {
    res.render(path.join(__dirname, '../views/index'))
}

function videoSuggestionApi(req: Request, res: Response) {
    let userEnteredName = req.query['name']

    fs.readdir(path.join(__dirname, MEDIA_PATH), (err: any, fileNames: string[]) => {
        // check sub string
        let matchedNames = fileNames.filter((fileName: string) => fileName.includes(userEnteredName))
        // check not full match
        matchedNames = matchedNames.filter((fileName: string) => fileName !== userEnteredName)
        res.json({ 'file_names': matchedNames })
    })

}

export { homePage, videoSuggestionApi }