const mongoose=require('mongoose')

const mentorschema=new mongoose.Schema({    
    mentorname:{type:String,required:true},
    studentsassigned:{type:Array}
},
{
    versionKey:false
})

const studentschema=new mongoose.Schema({
    studentname:{type:String,required:true},
    mentor:{type:String},
    mentorassigned:{type:Boolean},
    previousmentor:{type:String}
},
{
    versionKey:false
})

var mentormodel=mongoose.model('mentors',mentorschema)
var studentmodel=mongoose.model('students',studentschema)

module.exports={mentormodel,studentmodel}