const express = require("express")
const DepartmentModel = require("../Model/DepartModel")
const DepartCourses = require("../Model/DepartCourseModel")




const departCourseRouter = express.Router()



//post a course
departCourseRouter.post("/course", async(req, res)=>{
    try {
        const {name, code, level, semester, depart} = req.body
        if(!name || !code || !level || !semester){
            return res.status(422).json({error:"Please fill all required field"})
        }
        const department = await DepartmentModel.findOne({name:depart})
        if(!department){
            return res.status(422).json({error:"Department doesnt exist in our record"})
        }
        const newCourse = await DepartCourses({name,code,level,semester,depart:department._id})
        const savedCourse = await newCourse.save()
        if(savedCourse){
            await DepartmentModel.findOneAndUpdate({name:depart}, {$push:{courses:savedCourse._id}})
            return res.status(200).json({message:"Course created successfully"})
        }
        return res.status(400).json({error:"Error in creating course"})
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})


//get all course
departCourseRouter.get("/course", async(req, res)=>{
    try {
        const newCourse = await DepartCourses.find().populate("depart")
        if(newCourse){
            return res.status(200).json(newCourse)
        }
        return res.status(400).json({error:"Error in getting course"})
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})


departCourseRouter.get("/course/:id", async(req, res)=>{
    try {
        const newCourse = await DepartCourses.findById(req.params.id).populate("depart")
        if(!newCourse){
            return res.status(422).json({error:"Invalid Course"})
        }
        if(newCourse){
            return res.status(200).json(newCourse)
        }
        return res.status(400).json({error:"Error in getting course"})
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})



//update a course
departCourseRouter.put("/course/:id", async(req, res)=>{
    try {
        const {name, code, level, semester, depart} = req.body
        if(!name || !code || !level || !semester){
            return res.status(422).json({error:"Please fill all required field"})
        }
        const department = await DepartmentModel.findOne({name:depart})
        const cours = await DepartCourses.findById(req.params.id,)
        if(!department){
            return res.status(422).json({error:"Department doesnt exist in our record"})
        }
        if(!cours){
            return res.status(422).json({error:"Cannot find Course"})
        }
        await DepartmentModel.findOneAndUpdate({courses:req.params.id}, {$pull:{courses:req.params.id}})
        const newCourse = await DepartCourses.findByIdAndUpdate(req.params.id,{$set:{name,code,level,semester,depart:department._id}},{new:true})
        const savedCourse = await newCourse.save()
        if(savedCourse){
            await DepartmentModel.findOneAndUpdate({name:depart}, {$push:{courses:savedCourse._id}})
            return res.status(200).json({message:"Course Updated successfully"})
        }
        return res.status(400).json({error:"Error in updating course"})
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})



//delete a course
departCourseRouter.delete("/course/:id", async(req, res)=>{
    try {
        const cours = await DepartCourses.findById(req.params.id,)
        if(!cours){
            return res.status(422).json({error:"Cannot find Course"})
        }
       
        const deleteCourse = cours.deleteOne()
        if(deleteCourse){
             await DepartmentModel.findOneAndUpdate({courses:req.params.id}, {$pull:{courses:req.params.id}})
            return res.status(200).json({message:"Course deleted successfully"})
        }
        return res.status(400).json({error:"Error in deleting course"})
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})




module.exports = departCourseRouter