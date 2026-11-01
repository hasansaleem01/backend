import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

import connectDB from "./db/index.js"
import { app } from "./app.js"

connectDB() 

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
 console.log("MONGO DB coonection failed", err)
})















/*
(async () => {
    try {
       await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error", () => {
        console.log("ERROR", error);
        throw error
       })

app.listen(process.env.PORT, () => {
    console.log(`App is listening on port ${process.env.PORT}`);
})

    } catch (error) {
        console.log("ERROR", error)
        throw err
    }
})
*/