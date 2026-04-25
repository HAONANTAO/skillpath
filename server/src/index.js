import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import roadmapRoutes from './routes/roadmap.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/roadmap', roadmapRoutes)

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
