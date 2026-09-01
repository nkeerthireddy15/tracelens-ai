import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import healthRouter from './modules/health/health.routes.js'
import redactionRouter from './modules/redaction/redaction.routes.js'
const app = express()

app.use(helmet())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.use('/api/v1/health', healthRouter)
app.use('/api/v1/redactions', redactionRouter)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

export default app