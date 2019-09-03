import { Router } from "express"
import { homePage, videoSuggestionApi } from "./api"

const router = Router()

router.get('/', homePage)
// /videos?name=tod for 'today.mp4'
router.get('/videos', videoSuggestionApi)

export { router }