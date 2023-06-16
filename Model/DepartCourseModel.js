const mongoose = require("mongoose")



const departCourseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    level:{
        type:String,
        required:true
    },
    semester:{
        type:String,
        required:true
    },
    depart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    }
},{timestamps:true})


const DepartCourses = mongoose.model("DepartCourses", departCourseSchema)


module.exports = DepartCourses