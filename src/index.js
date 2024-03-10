import dotenv from 'dotenv'
import connectDB from "./database/connect.js";

dotenv.config({path: "./env"})

connectDB()