const express = require("express")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const mongoose = require("mongoose")
const facultyRouter = require("./Routes/Faculty")
const departRouter = require("./Routes/Department")
const studentAuthRouter = require("./Routes/StudentAuth")
const StudentUserRouter = require("./Routes/StudentUser")
const fileupload = require('express-fileupload');
const lecturerAuthRouter = require("./Routes/LecturerAuth")
const lecturerUserRouter = require("./Routes/LecturerUser")
const departCourseRouter = require("./Routes/DepartCourse")
const courseFormRouter = require("./Routes/CourseForm")


const app = express()
dotenv.config()



mongoose.connect(process.env.MONGODB_URL,{
    
},(err)=>{
    if(err){
        return console.error(err)
    }
    console.log("Connected to Database")
})



app.use(express.json({ extended: true }))
app.use(helmet())
app.use(morgan("common"))
app.use(fileupload({useTempFiles: true}))




app.use("/api/faculty", facultyRouter)
app.use("/api/depart", departRouter)
app.use("/api/auth", studentAuthRouter)
app.use("/api/student", StudentUserRouter)
app.use("/api/lecturer", lecturerUserRouter)
app.use("/api/auth", lecturerAuthRouter)
app.use("/api/", departCourseRouter)
app.use("/api/", courseFormRouter)





app.listen(process.env.PORT, ()=>{
    console.log(`server is listening on ${process.env.PORT}`)
})