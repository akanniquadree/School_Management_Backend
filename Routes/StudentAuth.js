const express = require("express")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const mailGun = require("nodemailer-mailgun-transport")
const crypto = require("crypto")
const Token = require("../Model/Token")
const StudentModel = require("../Model/StudentModel")
const FacultyModel = require("../Model/FacultyModel")
const DepartmentModel = require("../Model/DepartModel")


const studentAuthRouter = express.Router()
dotenv.config()
const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    debug:true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  })


//Add a student
studentAuthRouter.post("/register", async(req, res)=>{
    try {
        const {email, password, conPassword} = req.body
        const existEmail = await StudentModel.findOne({email})
        if(!email || !password || !conPassword){
            return res.status(400).json({error:"Please Fill all required field"})
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){ 
            return res.status(400).json({error:"Invalid Email"})
        }
        if(existEmail){
            return res.status(400).json({error:"Email already exist in our record"})
        }
        if(password !== conPassword){
            return res.status(400).json({error:"Password does not match"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = new StudentModel({ email,password:hashedPassword})
        const student = await user.save()
        if(student){
            const jwtToken = crypto.randomBytes(32).toString("hex")
            const d = new Date()
            const token = new Token({
                token:jwtToken,
                userId:student._id,
                expireToken: Date.now() + 360000
            }).save()
            
            const url = `${process.env.BASE_URL}/student/${student._id}/verify/${jwtToken}`
            const send = {
                to:student.email,
                from:"akanniquadry7@gmail.com",
                subject: "ACCOUNT VERIFICATION",
                html:`
                    <h4>Verify your email by clicking this </h4>
                    <p>${url}</p>
                    <p><a href="${url}">${url}</a></p>
                `
            }
        transporter.sendMail(send, function(err, data){
            if(err){
                console.log(err)
                return res.status(404).json({error: "Email cannot be sent"})
            }
            return res.status(201).json({message: "A mail has been sent to your Email, please verify your email"})
        })
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

//Login
studentAuthRouter.post("/login", async(req, res)=>{
    try {
        const {email, password} = req.body
     
        if(!email || !password) {
            return res.status(422).json({error:"Please fill all fields"})
        }
        const student = await StudentModel.findOne({email})
        if(!student){
            return res.status(422).json({error:"You have entered a wrong email or password"})
        }
        const verifyPassword = await bcrypt.compare(password, student.password)
        if(!verifyPassword){
            return res.status(422).json({error:"You have entered a wrong email or password"})
        }
        if(!student.verify){
            //activation token sent to the email
            const token = crypto.randomBytes(32).toString("hex")
            //Saving the token to the Token Model (one to one) pupolation
            const TokenSave = await Token.findOne({userId:student._id})
            if(!TokenSave){
                 const newToken = await new Token({
                     userId:user._id,
                     token: token,
                     expireToken: Date.now() + 360000
                 }).save()

                    //the url sent to the client email for verification
                 const url = `${process.env.BASE_URL}/student/${student._id}/verify/${token}`
                 const send = {
                     to:student.email,
                     from:"akanniquadry7@gmail.com",
                     subject: "ACCOUNT VERIFICATION",
                     html:`
                         <h4>Verify your email by clicking this </h4>
                         <p><a href="${url}">${url}</a></p>
                     `
                 }
                 transporter.sendMail(send).then(sent=>{
                     return res.status(201).json({message: "A mail has been sent to your Email, please verify your email "})
                 }, error => {
                    console.error(error);
                
                    if (error.response) {
                      console.error(error.response.body)
                    }
                  })
             }
             else{
                const savedToken = await Token.findOneAndUpdate({userId:student._id},{$set:{userId:student._id, token:token,expireToken: Date.now() + 360000}},{new:true})
                //the url sent to the client email for verification
                if(savedToken){
                        const url = `${process.env.BASE_URL}/users/${student._id}/verify/${token}`
                        const send = {
                            to:student.email,
                            from:"akanniquadry7@gmail.com",
                            subject: "ACCOUNT VERIFICATION",
                            html:`
                                <h4>Verify your email by clicking this </h4>
                                <p><a href="${url}">${url}</a></p>
                            `
                        }
                        transporter.sendMail(send).then(sent=>{
                            return res.status(201).json({message: "You havent verify your email, A mail has been sent to your Email, please verify your email "})
                        }, error => {
                        console.error(error);
                    
                        if (error.response) {
                            console.error(error.response.body)
                        }
                        })
                    }
            }
        }

        //     //Token that will be sent to the client
         if(student.verify){
          const tokenHeader = jwt.sign({_id:student._id},process.env.JWT_HEADER, {expiresIn:"5h"})
          const {password,verify,...others} = student._doc
          return res.status(200).json({tokenHeader, others})
         }
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})

//verify Account
studentAuthRouter.get("/student/:id/verify/:token", async(req, res)=>{
    try {
         //check if the user is available
        const student = await StudentModel.findById(req.params.id)
        if(!student){
            return res.status(400).json({error:"Invalid Link"})
        }
        const token = await Token.findOne({token:req.params.token})
        if(!token){
            return res.status(400).json({error:"Invalid Link"})
        }
        const Notexpire = await Token.findOne({userId:req.params.id, expireToken:{$gt:Date.now()}})
        if(!Notexpire){
            return res.status(400).json({error:"Please try to Log-in again, Session Expired"})
        }
        student.verify = true
        const verified = await student.save()
        if(verified){
            await Token.deleteOne()
            return res.status(200).json({message:"Email has been verified"})
        }
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
   
})

//Reset Password
studentAuthRouter.post("/resetPassword", async(req, res)=>{
    try {
        const {email} = req.body
        if(!email){
            return res.status(422).json({error:"Please fill in detail"})
        }
        let conditions = (email.indexOf("@") === -1) ? {matric:email} : {email:email}
        const student = await StudentModel.findOne(conditions)
        if(!student){
            return res.status(400).json({error:"User does not exist in our record"})
        }
        const token = crypto.randomBytes(32).toString("hex")
        student.resetToken = token
        student.expireToken = Date.now() +3600000
        const savedStudent = await student.save()
        if(savedStudent){
            url = `${process.env.BASE_URL}/student/${student._id}/resetpassword/${token}`
            const send = {
                to:`${savedStudent.email}`,
                from:"akanniquadry7@gmail.com",
                subject:"RESET PASSWORD",
                html: `<p>Click on the link below to reset your password</p>
                        <a href=${url}>${url}</a>
                        <p>Link expires in an hour</p>`
            }
            transporter.sendMail(send).then(sent=>{
                return res.status(201).json({message:"Check Your email to reset your password"})
            })
        }

    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

//new password
studentAuthRouter.post("/student/:id/resetpassword/:token", async(req, res)=>{
    try {
            const {password, conPassword} = req.body
            if(!password || !conPassword){
                return res.status(422).json({error:"Please fill all fields"})
            }  
            if(password !== conPassword){
                return res.status(422).json({error:"Password does not match"})
            }
          //check if the user is available
          const student = await StudentModel.findById(req.params.id)
          if(!student){
              return res.status(400).json({error:"Invalid Link"})
          }
          if(student.resetToken !== req.params.token){
              return res.status(400).json({error:"Invalid Link"})
          }
          const Notexpire = await StudentModel.findOne({resetToken:req.params.token, expireToken:{$gt:Date.now()}})
          if(!Notexpire){
            return res.status(400).json({error:"Please try to Log-in again, Session Expired"})
            }
          const salt = await bcrypt.genSalt(13)
          const hashedPassword = await bcrypt.hash(password, salt)
          student.password = hashedPassword
          student.resetToken = undefined
          student.expireToken =undefined
          const newpassword = await student.save()
          if(newpassword){
            return  res.status(200).json({message:"Password successfully updated"})
        }
          
         
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

module.exports = studentAuthRouter
