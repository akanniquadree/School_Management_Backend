const mongoose = require("mongoose")

const studentSchema = mongoose.Schema({
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
    matric:{
        type:String,
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
    profPic:{
        type:String,
        default:""
    },
    level:{
        type:String,
        required:true,
        trim:true
    },
    semester:{
        type:String,
        required:true,
        trim:true
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
    resetToken:String,
    expireToken:Date
},
{timestamps:true}
)


const StudentModel = mongoose.model("Students", studentSchema)

module.exports = StudentModel