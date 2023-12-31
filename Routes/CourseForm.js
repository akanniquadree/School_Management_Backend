const express = require("express")
const StudentModel = require("../Model/StudentModel")
const DepartmentModel = require("../Model/DepartModel")
const CourseFormModel = require("../Model/CourseFormModel")
const { StudentLogin, IsAuth } = require("../Middlewares/Middleware")



const courseFormRouter = express.Router()




//get all courses of a student according to department level and semester
courseFormRouter.get("/courseform/:id", StudentLogin,IsAuth,async(req, res)=>{
    try {
        const student = await StudentModel.findById(req.params.id)
        const depart = await DepartmentModel.findOne({students:req.params.id}).populate("courses")
        if(!student){
            return res.status(422).json({error:"Cannot find Account"})
        }
        const existCourseForm = await CourseFormModel.findOne({student:req.user._id})
        if(existCourseForm.semester === student.semester || existCourseForm.level === student.level){
            return res.status(422).json({error:"You have already submitted your course form"})
        }
        //get courses of student department associated with user level
        const courses = depart.courses.filter((cour)=>cour.level === student.level)
        //get courses  user semester
        const semCourses = courses.filter((cour)=>cour.semester === student.semester)
        if(semCourses){
            return res.status(200).json(semCourses)
        }
        return res.status(422).json({error:"Cannot find Courses"})
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

//save course form
courseFormRouter.post("/courseform/:id", StudentLogin,IsAuth, async(req, res)=>{
    try {
        const {course} = req.body
        if(!course){
            return res.status(422).json({error:"Please tick courses to offer"})
        }
        const student = await StudentModel.findById(req.params.id)
        if(!student){
            return res.status(422).json({error:"Cannot find Account"})
        }
        const existCourseForm = await CourseFormModel.findOne({student:req.user._id})
        if(existCourseForm.semester === student.semester || existCourseForm.level === student.level){
            return res.status(422).json({error:"You have already submitted your course form"})
        }
        const courses = new CourseFormModel({
            level:student.level,
            semester:student.semester,
            students: student._id,
            courses: course
        })
        const savedCourse = await courses.save()
        if(savedCourse){
            await student.updateOne({$push:{courseForm:savedCourse._id}})
            return res.status(200).json({message:"Courses uploaded successfully"})
        }
        return res.status(422).json({error:"Error in Uploading course"})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})

//get submitted course form per semester //UserId
courseFormRouter.get("/courseform/student/:id", StudentLogin,IsAuth, async(req, res)=>{
    try {
        const course = await CourseFormModel.findOne({students:req.params.id}).populate("courses")
        if(!course){
            return res.status(422).json({error:"Cannot find Account"})
        }
        return res.status(200).json(course)
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

//get all submitted course form //UserId
courseFormRouter.get("/courseforms/student/:id",  StudentLogin,IsAuth, async(req, res)=>{
    try {
        const course = await CourseFormModel.findById({students:req.params.id}).sort("-createdAt").populate("courseForm")
        if(!course){
            return res.status(422).json({error:"Cannot find Account"})
        }
        return res.status(200).json(course)
    } catch (error) {
        console.log(error)
            return res.status(500).json(error)
    }
})

module.exports = courseFormRouter