const mongoose = require("mongoose")

const facultySchema = mongoose.Schema({
    faculty:{
        type:String,
        required:true,
    },
    facultyCode:{
        type:String,
        required:true,
    },
    depart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    }],
    resetToken:String,
    expireToken:Date
},
{timestamps:true}
)


const FacultyModel = mongoose.model("Faculty", facultySchema)

module.exports = FacultyModel