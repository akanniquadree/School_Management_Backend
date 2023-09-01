const express = require("express")
const StudentModel = require("../Model/StudentModel")
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary")
const { StudentLogin, IsAuth } = require("../Middlewares/Middleware")
const ProgramModel = require("../Model/ProgramModel")



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

StudentUserRouter.post("/registration/:id", async(req, res)=>{
    try {
        const user = await StudentModel.findById(req.params.id)
        const {first_name,program, surname,other_name,origin,height,dob,gender, mobile, faculty, level,semester, depart,hnd,hnd_pic,nd,nd_pic,ssce,ssce_pic, add} = req.body
        if(!first_name || !surname || !semester ||!origin||!ssce ||!ssce_pic ||!gender ||!height || !dob || !mobile || !faculty || !level || !depart|| !add){
            return res.status(400).json({error:"Please Fill all required field"})
        }
        if (!user){ 
            return res.status(400).json({error:"Invalid User"})
        }
        const Faculty = await   FacultyModel.findOne({faculty})
        const Depart = await   DepartmentModel.findOne({name:depart})
        const Program = await ProgramModel.findOne({program})
        if(!Faculty){
            return res.status(400).json({error:"Faculty doesnot exist in our record"})
        }
        if(!Depart){
            return res.status(400).json({error:"Department doesnot exist in our record"})
        }
        if(!Program){
            return res.status(400).json({error:"Program doesnot exist in our record"})
        }
        const Hnd_cloud = await cloudinary.uploader.upload(req.files.hnd_pic.tempFilePath,{
            folder:`students/${user.email}`,
            resource_type:"auto"
        })
        const Nd_cloud = await cloudinary.uploader.upload(req.files.nd_pic.tempFilePath,{
            folder:`students/${user.email}`,
            resource_type:"auto"
        })
        const Ssce_cloud = await cloudinary.uploader.upload(req.files.ssce_pic.tempFilePath,{
            folder:`students/${user.email}`,
            resource_type:"auto"
        })
        const code = crypto.randomBytes(3).toString("hex")
        const y = new Date()
        const date = y.getUTCFullYear().toString()
        user.first_name = first_name
        user.surname = surname
        user.program = Program._id
        user.other_name = other_name
        user.origin = origin
        user.ssce = ssce
        user.ssce_pic = Ssce_cloud.url
        user.gender = gender
        user.faculty = Faculty._id
        user.depart = Depart._id
        user.semester = semester
        user.mobile = mobile
        user.level = level
        user.height = height
        user.dob = dob
        user.hnd = hnd
        user.hnd_pic = Hnd_cloud.url
        user.nd = nd
        user.nd_pic = Nd_cloud.url
        user.add = add
        user.matric = date +"/"+Faculty.facultyCode +"/"+Depart.departCode+"/"+Program.code+"/"+code
        user.session = session
        const student = await user.save()
        if(student){
            await Depart.updateOne({$push:{students:student._id}})
            return res.status(201).json({message: "Registration Submitted Successfully"})
        }
        
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