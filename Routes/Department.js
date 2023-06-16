const express = require("express")
const DepartmentModel = require("../Model/DepartModel")
const FacultyModel = require("../Model/FacultyModel")
const crypto = require("crypto")


const departRouter = express.Router()


//Add a Faculty
departRouter.post("/", async(req, res)=>{
    try {
        const {name, faculty} = req.body
        const Faculty = await FacultyModel.findOne({faculty})
        if(!name){
            return res.status(400).json({error:"Please fill all field"})
        }
        const existingFac = await DepartmentModel.findOne({name})
        if(existingFac){
            return res.status(400).json({error:"Depart already exist in our record"})
        }
        const code = crypto.randomBytes(2).toString("hex")
        const fac = new DepartmentModel({name, faculty:Faculty._id, departCode:code})
        const saveFac = await fac.save()
        if(saveFac){
            
            const exFaculty = await FacultyModel.findOneAndUpdate({faculty},{$push:{depart:saveFac._id}})
            if(exFaculty){
               return res.status(200).json({message:"Department saved successfully"}) 
            }
            
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json(error)
        
    }
})

//get all department
departRouter.get("/", async(req, res)=>{
    try {
        const department = await DepartmentModel.find().populate("faculty","faculty")
        if(department){
            return res.status(200).json(department) 
        }
        return res.status(400).json({error:"Error in getting department"})
    } catch (error) {
        console.error(error)
        return res.status(500).json(error) 
    }
})


//update a department
departRouter.put("/:id", async(req, res)=>{
    try {
         const {name, faculty} = req.body
        const depart = await DepartmentModel.findById(req.params.id)
        const Faculty = await FacultyModel.findOne({faculty})
        if(!name || !faculty){
            return res.status(400).json({error:"Please fill all field"})
        }
        if(!depart){
            return res.status(400).json({error:"Department doesnt exist in our record"})
        }
        if(!Faculty){
            return res.status(400).json({error:"Faculty doesnt exist in our record"})
        }
        await depart.updateOne({$set:{name, faculty:Faculty._id}},{new:true})
        const saveFac = await FacultyModel.findOneAndUpdate({depart:req.params.id}, {$pull:{depart:req.params.id}})
        if(saveFac){
            const exFaculty = await FacultyModel.findOneAndUpdate({faculty},{$push:{depart:depart._id}})
            if(exFaculty){
            return res.status(200).json({message:"Department updated successfully"}) 
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json(error) 
    }
   
})


//delete a department
departRouter.delete("/:id", async(req, res)=>{
    try {
        const depart = await DepartmentModel.findByIdAndDelete(req.params.id)
       if(depart){
            const exFaculty = await FacultyModel.findOneAndUpdate({depart:req.params.id},{$pull:{depart:depart._id}})
        if(exFaculty){
           return res.status(200).json({message:"Department deleted successfully"}) 
        }
    } 
    } catch (error) {
        console.error(error)
        return res.status(500).json(error) 
    }
    
})


//get a department
departRouter.get("/:id", async(req, res)=>{
    try {
        const department = await DepartmentModel.findById(req.params.id).populate("faculty","faculty")
        if(department){
            return res.status(200).json(department) 
        }
        return res.status(400).json({error:"Error in getting department"})
    } catch (error) {
        console.error(error)
        return res.status(500).json(error) 
    }
})


module.exports = departRouter