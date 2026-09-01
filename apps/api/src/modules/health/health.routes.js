import { Router } from 'express'

const healthRouter = Router()

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TraceLens API is healthy',
    timestamp: new Date().toISOString()
  })
})

export default healthRouter