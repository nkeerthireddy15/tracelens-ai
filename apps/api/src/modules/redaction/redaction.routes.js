import { Router } from 'express'
import { previewRedaction } from './redaction.controller.js'

const redactionRouter = Router()

redactionRouter.post('/preview', previewRedaction)

export default redactionRouter