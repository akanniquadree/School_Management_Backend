const jwt = require("jsonwebtoken")
const StudentModel = require("../Model/StudentModel")
const LecturerModel = require("../Model/LecturerModel")
const dotenv = require("dotenv")

dotenv.config()

const StudentLogin = (req, res, next) =>{
    try{
        const {authorization} = req.headers
        if(!authorization){
            return res.status(401).json({error:"Your session has ended, please log in again"})
        }
        const token = authorization.replace("Bearer ", "")
        jwt.verify(token, process.env.JWT_HEADER, async(err, payload)=>{
            if(err){
                return res.status(401).json({error:"You are not authorized, You must be logged in!"})
            }
            const {_id} = payload
            await StudentModel.findById(_id).then(savedUser=>{
                req.user = savedUser
                next()
            })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

const LecturerLogin = (req, res, next) =>{
    try{
        const {authorization} = req.headers
        if(!authorization){
            return res.status(401).json({error:"Your session has ended, please log in again"})
        }
        const token = authorization.replace("Bearer ", "")
        jwt.verify(token, process.env.JWT_ACTIVATION, async(err, payload)=>{
            console.log(err)
            if(err){
                return res.status(401).json({error:"You are not authorized, You must be logged in!"})
            }
            const {_id} = payload
            await LecturerModel.findById(_id).then(savedUser=>{
                req.user = savedUser
                next()
            })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}


const IsAuth = async(req, res, next) =>{
    if(req.params.id.toString() === req.user.id.toString() || req.user.isAdmin ){
       return  next()
    }
    return res.status(401).json({error:"You are not authorized to carry out this operation"})
   
}


const IsAdmin = async(req, res, next) =>{
    if(req.user && req.user.isAdmin){
        return next();
    }
    return res.status(401).json({error:"You are not authorized to carry out this operation"})

}

const IsSuperAdmin = async(req, res, next) =>{
    if(req.user && req.user.isAdmin && req.user.IsSuperAdmin){
        return next();
    }
    return res.status(401).json({error:"You are not authorized to carry out this operation"})

}




module.exports = {StudentLogin, LecturerLogin, IsAdmin, IsAuth, IsSuperAdmin}