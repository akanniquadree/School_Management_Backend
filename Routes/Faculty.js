const express = require("express")
const FacultyModel = require("../Model/FacultyModel")
const crypto = require("crypto")


const facultyRouter = express.Router()




//Add a Faculty
facultyRouter.post("/", async(req, res)=>{
    try {
        const {faculty} = req.body
        if(!faculty){
            return res.status(400).json({error:"Please fill all field"})
        }
        const existingFac = await FacultyModel.findOne({faculty})
        if(existingFac){
            return res.status(400).json({error:"Faculty already exist in our record"})
        }
        const code = crypto.randomBytes(1).toString("hex")
        const fac = new FacultyModel({faculty, facultyCode:code})
        const saveFac = await fac.save()
        if(saveFac){
            return res.status(200).json({message:"Faculty saved successfully"})
        }
    } catch (error) {
       console.error(error) 
       return res.status(500).json(error)
        
    }
})


//Get all Faculty
facultyRouter.get("/", async(req, res)=>{
    try {
        const fac = await FacultyModel.find().populate("depart")
        if(fac){
            return res.status(200).json(fac)
        }
    } catch (error) {
        return res.status(500).json(error)
    }
})


//Get a Faculty
facultyRouter.get("/:id", async(req, res)=>{
    try {
        const fac = await FacultyModel.findById(req.params.id).populate("depart")
        if(fac){
            return res.status(200).json(fac)
        }
    } catch (error) {
        return res.status(500).json(error)
    }
})

//Update a Faculty
facultyRouter.put("/:id", async(req, res)=>{
    try {
        const {faculty} = req.body
        if(!faculty){
            return res.status(400).json({error:"Please fill all field"})
        }
        const fac = await FacultyModel.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
        if(fac){
            return res.status(200).json({message:"Faculty updated successfully"})
        }
        return res.status(422).json({error:"Error in updating Faculty"})
    } catch (error) {
        return res.status(500).json(error)
    }
})

//delete a Faculty
facultyRouter.delete("/:id", async(req, res)=>{
    try {
        const fac = await FacultyModel.findByIdAndDelete(req.params.id)
        if(fac){
            return res.status(200).json({message:"Faculty deleted successfully"})
        }
        return res.status(422).json({error:"Error in deleting Faculty"})
    } catch (error) {
        return res.status(500).json(error)
    }
})





module.exports = facultyRouter