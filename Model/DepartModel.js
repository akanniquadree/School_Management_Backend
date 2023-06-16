const mongoose = require("mongoose")

const departmentSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    departCode:{
        type:String,
        required:true,
    },
    faculty:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Faculty"
    },
    lecturers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecturers"
    }],
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Students"
    }],
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DepartCourses"
    }],
    resetToken:String,
    expireToken:Date
},
{timestamps:true}
)


const DepartmentModel = mongoose.model("Department", departmentSchema)

module.exports = DepartmentModel