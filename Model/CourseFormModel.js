const mongoose = require("mongoose")

const courseFormSchema = mongoose.Schema({
    students:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Students"
    },
    level:{
        type:String,
        required:true,
    },
    semester:{
        type:String,
        required:true,
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DepartCourses"
    }],
    expireToken:Date
},
{timestamps:true}
)


const CourseFormModel = mongoose.model("CourseForm", courseFormSchema)

module.exports = CourseFormModel