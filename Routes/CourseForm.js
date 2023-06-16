const express = require("express")



const courseFormRouter = express.Router()




//save course form
courseFormRouter.post("/courseform/:id", async(req, res)=>{
    try {
        const {course} = req.body
        if(!course){
            return res.status(422).json({error:"Please tick courses to offer"})
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
})