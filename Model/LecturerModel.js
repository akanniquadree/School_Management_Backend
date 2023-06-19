const mongoose = require("mongoose")

const lecturerSchema = mongoose.Schema({
    first_name:{
        type:String,
        required:true,
    },
    last_name:{
        type:String,
        required:true,
        min:3,
    },
    other_name:{
        type:String,
        default:false
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        min:5,
        trim:true
    },
    verify:{
        type:Boolean,
        default:false
    },
    dob:{
        type:Date,
        required:true,
        trim:true
    },
    mobile:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
        default:""
    },
    add:{
        type:String,
    }, 
    faculty:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Faculty"
    },
    depart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isSuperAdmin:{
        type:Boolean,
        default:false
    },
    myCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"LectureCourses"
    }],
    resetToken:String,
    expireToken:Date
},
{timestamps:true}
)


const LecturerModel = mongoose.model("Lecturers", lecturerSchema)

module.exports = LecturerModel