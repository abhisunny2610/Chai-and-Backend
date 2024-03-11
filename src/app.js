import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// cors option is that we only access the backend with some origion not all
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// for get the json data
app.use(express.json({limit: "25kb"}))

// for getting the url data
app.use(express.urlencoded({extended: true, limit: "25kb"}))

// for uploading or serving the statics files
app.use(express.static("public"))

// for cookieparser
app.use(cookieParser())


// routes import
import userRoutes from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRoutes)

export { app }