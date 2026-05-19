import express from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import { userRoute } from './APIs/userAPI.js'
import { authorRoute } from './APIs/authorAPI.js'
import { adminRoute } from './APIs/adminAPI.js'
import cookieParser from 'cookie-parser'
import { commonRouter } from './APIs/commonAPI.js'
import cors from 'cors'

config() // process .env

const app = express()

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend.vercel.app'
    ],
    credentials: true
}))

// Add body parser middleware
app.use(express.json())
app.use(cookieParser())

// connect APIs
app.use('/user-api', userRoute)
app.use('/author-api', authorRoute)
app.use('/admin-api', adminRoute)
app.use('/common-api', commonRouter)

// Home Route
app.get('/', (req, res) => {
    res.send("Backend is running successfully")
})

// Connect to Database
const connectDB = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("DB connection success")

        const PORT = process.env.PORT || 4000

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })

    } catch (err) {
        console.log("Err in DB connection", err)
    }
}

connectDB()

// dealing with invalid paths
app.use((req, res, next) => {
    res.status(404).json({
        message: "Invalid path"
    });
})

// error handling middleware
app.use((err, req, res, next) => {

    // mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    // mongoose cast error
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        const value = keyValue[field];

        return res.status(409).json({
            message: "error occurred",
            error: `${field} "${value}" already exists`,
        });
    }

    // handle custom errors
    if (err.status) {
        return res.status(err.status).json({
            message: "error occurred",
            error: err.message,
        });
    }

    // default server error
    res.status(500).json({
        message: "error occurred",
        error: "Server side error",
    });
})

export default app