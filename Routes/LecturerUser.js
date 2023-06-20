const express = require("express")
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary")
const LecturerModel = require("../Model/LecturerModel")
const DepartCourses = require("../Model/DepartCourseModel")
const LectureCourseModel = require("../Model/LecturerCourse")
const { LecturerLogin, IsAdmin } = require("../Middlewares/Middleware")



const lecturerUserRouter = express.Router()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

  })
//Change Password
lecturerUserRouter.post("/newpassword/:id", async(req, res)=>{
    try {
        const {oldPassword, newPassowrd, conPassword} = req.body
        if(!newPassowrd || !conPassword || !oldPassword){
            return res.status(422).json({error:"Please fill all fields"})
        }  
        if(newPassowrd !== conPassword){
            return res.status(422).json({error:"Password does not match"})
        }
        const lecturer = await LecturerModel.findById(req.params.id)
        if(!lecturer){
        return res.status(400).json({error:"User cannot be found"})
        }
        const correctpassword = await bcrypt.compare(oldPassword, lecturer.password)
        if(!correctpassword){
            return res.status(400).json({error:"Please enter the correct old password"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(newPassowrd, salt)
        lecturer.password = hashedPassword
        const savedpassword = await lecturer.save()
        if(savedpassword){
            return  res.status(200).json({message:"Password successfully updated"})
        }
        return  res.status(400).json({error:"Error in updating password"})

    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

//Upload Profile picture
lecturerUserRouter.post("/image/:id", async(req, res)=>{
    try {
        const data = req.files.image
        if(!data){
            return res.status(422).json({error:"Please insert an image"})
        }
        const lecturer = await LecturerModel.findById(req.params.id)
        if(!lecturer){
            return res.status(400).json({error:"User cannot be found"})
        }
        const cloud = await cloudinary.uploader.upload(data.tempFilePath,{
            folder:"lecturers",
            resource_type:"auto",
        })
        if(cloud){
            lecturer.profPic = cloud.url
            const savedPic = await lecturer.save()
            if(savedPic){
                return res.status(200).json({message:"Image Uploaded Successfully"})
            }
        }
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})


//get all lecturer of a department
// departCourseRouter.get("/depart", async(req, res)=>{
//     try {
//         const lecturers = await 
//         if(newCourse){
//             return res.status(200).json(newCourse)
//         }
//         return res.status(400).json({error:"Error in getting course"})
//     } catch (error) {
//         console.log(error)
//             return res.status(500).json(error)
//     }
// })


//Get all lecturers by department

//Assigning Course to lecturer by admin
lecturerUserRouter.post("/courses",LecturerLogin,IsAdmin, async(req, res)=>{
    try {
        const {course, lecturer} = req.body
        if(!course || !lecturer){
            return res.status(422).json({error:"Please fill all fields"})
        }
        const existCourse = await DepartCourses.findOne({name:course})
        const existLecturer = await LecturerModel.findOne({first_name:lecturer})
        if(!existCourse){
            return res.status(422).json({error:"Course doesnt exist in our record"})
        }
        if(!existLecturer){
            return res.status(422).json({error:"Lecturer doesnt exist in our record"})
        }
        const newCourse = new LectureCourseModel({
            lecturer:existLecturer._id,
            course:existCourse._id,
            level:existCourse.level,
            semester:existCourse.semester
        })
        const savedCourse = await newCourse.save()
        if(savedCourse){
            await existLecturer.updateOne({$push:{myCourses:savedCourse._id}})
            return res.status(200).json({message:"Course assign to lecturer successfully"})
        }
    } catch (error) {
            console.log(error)
                return res.status(500).json(error)
    }
})



module.exports = lecturerUserRouter