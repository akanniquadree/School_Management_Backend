const mongoose = require("mongoose")

const lecturercourseSchema = mongoose.Schema({
    lecturer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecturers"
    },
    level:{
        type:String,
        required:true,
    },
    semester:{
        type:String,
        required:true,
    },
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DepartCourses"
    }],
},
{timestamps:true}
)


const LectureCourseModel = mongoose.model("LectureCourses", lecturercourseSchema)

module.exports = LectureCourseModel