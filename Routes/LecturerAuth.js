const express = require("express")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sgMail = require("@sendgrid/mail")
const crypto = require("crypto")
const Token = require("../Model/Token")
const FacultyModel = require("../Model/FacultyModel")
const DepartmentModel = require("../Model/DepartModel")
const LecturerModel = require("../Model/LecturerModel")

const lecturerAuthRouter = express.Router()
dotenv.config()
sgMail.setApiKey(process.env.SENDGRID_TRANSPORT)

//Add a lecturer
lecturerAuthRouter.post("/lecturer/register", async(req, res)=>{
    try {
        const {first_name, last_name,other_name, email, password, conPassword,dob, mobile, faculty, depart, add} = req.body
        const Faculty = await   FacultyModel.findOne({faculty})
        const Depart = await   DepartmentModel.findOne({name:depart})
        const existEmail = await LecturerModel.findOne({email})
        if(!first_name || !last_name ||!other_name || !email || !password || !conPassword || !dob || !mobile || !faculty || !depart|| !add){
            return res.status(400).json({error:"Please Fill all required field"})
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){ 
            return res.status(400).json({error:"Invalid Email"})
        }
        if(existEmail){
            return res.status(400).json({error:"Email already exist in our record"})
        }
        if(!Faculty){
            return res.status(400).json({error:"Faculty doesnot exist in our record"})
        }
        if(!Depart){
            return res.status(400).json({error:"Department doesnot exist in our record"})
        }
        if(password !== conPassword){
            return res.status(400).json({error:"Password does not match"})
        }
        const salt = await bcrypt.genSalt(13)
        const hashedPassword = await bcrypt.hash(password, salt)
        const code = crypto.randomBytes(3).toString("hex")
        const y = new Date()
        const date = y.getUTCFullYear().toString()
        const user = new LecturerModel({first_name, last_name,other_name, email,faculty:Faculty._id,depart:Depart._id, password:hashedPassword, dob, mobile, add})
        const lecturer = await user.save()
        if(lecturer){
            await Depart.updateOne({$push:{lecturers:lecturer._id}})
            const jwtToken = crypto.randomBytes(32).toString("hex")
            const token = new Token({
                token:jwtToken,
                userId:lecturer._id,
                expireToken: Date.now() + 360000
            }).save()

            const url = `${process.env.BASE_URL}/lecturer/${lecturer._id}/verify/${token.token}`
            const send = {
                to:lecturer.email,
                from:"akanniquadry7@gmail.com",
                subject: "ACCOUNT VERIFICATION",
                html:`
                    <h4>Your Matric Number is ${lecturer.matric}</h4>
                    <h4>Verify your email by clicking this </h4>
                    <p>${url}</p>
                    <p><a href="${url}">${url}</a></p>
                `
            }
        const succes =  sgMail.send(send)
        if(succes){
                return res.status(201).json({message: "A mail has been sent to your Email, please verify your email"})
            }
            else{
                return res.status(404).json({error: "Email cannot be sent"})
            }
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})


//sign in
lecturerAuthRouter.post("/lecturer/login", async(req, res)=>{
    try {
        const {email, password} = req.body
        //Checking for either the email or username and password field if they are empty
        if(!email || !password) {
            return res.status(422).json({error:"Please fill all fields"})
        }
        const lecturer = await LecturerModel.findOne({email})
        if(!lecturer){
            return res.status(422).json({error:"You have entered a wrong email or password"})
        }
        const verifyPassword = await bcrypt.compare(password, lecturer.password)
        if(!verifyPassword){
            return res.status(422).json({error:"You have entered a wrong email or password"})
        }
        if(!lecturer.verify){
            //activation token sent to the email
            const token = crypto.randomBytes(32).toString("hex")
            //Saving the token to the Token Model (one to one) pupolation
            const TokenSave = await Token.findOne({userId:lecturer._id})
            if(!TokenSave){
                 const newToken = await new Token({
                     userId:user._id,
                     token: token,
                     expireToken: Date.now() + 360000
                 }).save()

                    //the url sent to the client email for verification
                 const url = `${process.env.BASE_URL}/users/${lecturer._id}/verify/${newToken.token}`
                 const send = {
                     to:lecturer.email,
                     from:"akanniquadry7@gmail.com",
                     subject: "ACCOUNT VERIFICATION",
                     html:`
                         <h4>Verify your email by clicking this </h4>
                         <p><a href="${url}">${url}</a></p>
                     `
                 }
                 sgMail.send(send).then(sent=>{
                     return res.status(201).json({message: "A mail has been sent to your Email, please verify your email "})
                 }, error => {
                    console.error(error);
                
                    if (error.response) {
                      console.error(error.response.body)
                    }
                  })
             }
             else{
                const savedToken = await Token.findOneAndUpdate({userId:lecturer._id},{$set:{userId:lecturer._id, token:token,expireToken: Date.now() + 360000}},{new:true})
                //the url sent to the client email for verification
                if(savedToken){
                        const url = `${process.env.BASE_URL}/users/${lecturer._id}/verify/${savedToken.token}`
                        const send = {
                            to:lecturer.email,
                            from:"akanniquadry7@gmail.com",
                            subject: "ACCOUNT VERIFICATION",
                            html:`
                                <h4>Verify your email by clicking this </h4>
                                <p><a href="${url}">${url}</a></p>
                            `
                        }
                        sgMail.send(send).then(sent=>{
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
         if(lecturer.verify){
          const tokenHeader = jwt.sign({_id:lecturer._id},process.env.JWT_HEADER)
          const {password,verify,...others} = user._doc
          return res.status(200).json({tokenHeader, others})
         }
    } catch (error) {
            console.log(error)
            return res.status(500).json(error)
    }
})

//verify Account
lecturerAuthRouter.get("/lecturer/:id/verify/:token", async(req, res)=>{
    try {
         //check if the user is available
        const lecturer = await LecturerModel.findById(req.params.id)
        if(!lecturer){
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
        lecturer.verify = true
        const verified = await lecturer.save()
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
lecturerAuthRouter.post("/lecturer/resetPassword", async(req, res)=>{
    try {
        const {email} = req.body
        if(!email){
            return res.status(422).json({error:"Please fill in detail"})
        }
        const lecturer = await LecturerModel.findOne({email})
        if(!lecturer){
            return res.status(400).json({error:"User does not exist in our record"})
        }
        const token = crypto.randomBytes(32).toString("hex")
        lecturer.resetToken = token
        lecturer.expireToken = Date.now() +3600000
        const savedlecturer = await lecturer.save()
        if(savedlecturer){
            url = `${process.env.BASE_URL}/lecturer/${lecturer._id}/resetpassword/${token}`
            const send = {
                to:`${savedlecturer.email}`,
                from:"akanniquadry7@gmail.com",
                subject:"RESET PASSWORD",
                html: `<p>Click on the link below to reset your password</p>
                        <a href=${url}>${url}</a>
                        <p>Link expires in an hour</p>`
            }
            sgMail.send(send).then(sent=>{
                return res.status(201).json({message:"Check Your email to reset your password"})
            })
        }

    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

//new password
lecturerAuthRouter.post("/lecturer/:id/resetpassword/:token", async(req, res)=>{
    try {
            const {password, conPassword} = req.body
            if(!password || !conPassword){
                return res.status(422).json({error:"Please fill all fields"})
            }  
            if(password !== conPassword){
                return res.status(422).json({error:"Password does not match"})
            }
          //check if the user is available
          const lecturer = await LecturerModel.findById(req.params.id)
          if(!lecturer){
              return res.status(400).json({error:"Invalid Link"})
          }
          if(lecturer.resetToken !== req.params.token){
              return res.status(400).json({error:"Invalid Link"})
          }
          const Notexpire = await LecturerModel.findOne({resetToken:req.params.token, expireToken:{$gt:Date.now()}})
          if(!Notexpire){
            return res.status(400).json({error:"Please try to Log-in again, Session Expired"})
            }
          const salt = await bcrypt.genSalt(13)
          const hashedPassword = await bcrypt.hash(password, salt)
          lecturer.password = hashedPassword
          lecturer.resetToken = undefined
          lecturer.expireToken =undefined
          const newpassword = await lecturer.save()
          if(newpassword){
            return  res.status(200).json({message:"Password successfully updated"})
        }
          
         
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

module.exports = lecturerAuthRouter
