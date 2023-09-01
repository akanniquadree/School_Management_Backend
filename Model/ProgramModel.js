const mongoose = require("mongoose")

const programSchema = mongoose.Schema({
    program:String,
    code:String,
},
{timestamps:true}
)


const ProgramModel = mongoose.model("Program", programSchema)

module.exports = ProgramModel