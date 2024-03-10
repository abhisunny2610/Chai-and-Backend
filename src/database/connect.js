import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        // console.log("connection instance ", connectionInstance)
        console.log(`\n MongoDb connnected... !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error while connecting database", error)
        process.exit(1)
    }
}

export default connectDB