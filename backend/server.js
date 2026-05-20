import express from 'express'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import { userRoute } from './APIs/userAPI.js'
import { authorRoute } from './APIs/authorAPI.js'
import { adminRoute } from './APIs/adminAPI.js'
import cookieParser from 'cookie-parser'
import { commonRouter } from './APIs/commonAPI.js'
import cors from 'cors'

config()

const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://blog-app-main-delta.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// API routes
app.use('/user-api', userRoute)
app.use('/author-api', authorRoute)
app.use('/admin-api', adminRoute)
app.use('/common-api', commonRouter)

// Home route
app.get('/', (req, res) => {
    res.send("Backend is running successfully")
})

// MongoDB Connection
const connectDB = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI)

        console.log("MongoDB Connected Successfully")

        const PORT = process.env.PORT || 4000

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })

    } catch (err) {

        console.log("Err in DB connection", err)

        process.exit(1)
    }
}

connectDB()

// Invalid path handler
app.use((req, res, next) => {
    res.status(404).json({
        message: "Invalid path"
    })
})

// Error handling middleware
app.use((err, req, res, next) => {

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        })
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        })
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue

    if (errCode === 11000) {

        const field = Object.keys(keyValue)[0]
        const value = keyValue[field]

        return res.status(409).json({
            message: "error occurred",
            error: `${field} "${value}" already exists`,
        })
    }

    if (err.status) {
        return res.status(err.status).json({
            message: "error occurred",
            error: err.message,
        })
    }

    res.status(500).json({
        message: "error occurred",
        error: "Server side error",
    })
})

export default app