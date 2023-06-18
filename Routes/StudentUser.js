const express = require("express")
const StudentModel = require("../Model/StudentModel")
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary")
const { StudentLogin, IsAuth } = require("../Middlewares/Middleware")



const StudentUserRouter = express.Router()
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

  })
//Change Password
StudentUserRouter.post("/newpassword/:id", StudentLogin,IsAuth, async(req, res)=>{
    try {
        const {oldPassword, newPassword, conPassword} = req.body
        if(!newPassword || !conPassword || !oldPassword){
            return res.status(422).json({error:"Please fill all fields"})
        }  
        if(newPassword !== conPassword){
            return res.status(422).json({error:"Password does not match"})
        }
        const student = await StudentModel.findById(req.user._id)
        console.log(req.user)
        if(!student){
        return res.status(400).json({error:"User cannot be found"})
        }
        const correctpassword = await bcrypt.compare(oldPassword, student.password)
        if(!correctpassword){
            return res.status(400).json({error:"Please enter the correct old password"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        student.password = hashedPassword
        const savedpassword = await student.save()
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
StudentUserRouter.post("/image/:id", StudentLogin,IsAuth, async(req, res)=>{
    try {
        const data = req.files.image
        console.log(data)
        if(!data){
            return res.status(422).json({error:"Please insert an image"})
        }
        const student = await StudentModel.findById(req.params.id)
        if(!student){
            return res.status(400).json({error:"User cannot be found"})
        }
        const cloud = await cloudinary.uploader.upload(data.tempFilePath,{
            folder:"students",
            resource_type:"auto",
        })
        if(cloud){
            student.profPic = cloud.url
            const savedPic = await student.save()
            if(savedPic){
                return res.status(200).json({message:"Image Uploaded Successfully"})
            }
        }
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

module.exports = StudentUserRouter