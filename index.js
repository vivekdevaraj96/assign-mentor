const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { dburl } = require("./dbconfig");
const { mentormodel, studentmodel } = require("./schema");

mongoose.connect(dburl);

app.use(express.json());

// -------------------------------------------------------------------------------------------------------------------------------------------------
// 1.   creating a mentor
//

// req.body must be in the below format
// {
//   "mentorname":"Divya",
//   "studentsassigned":[]
// }

app.post("/creatementor", async (req, res) => {
  try {
    var data = await mentormodel.findOne({ mentorname: req.body.mentorname });
    if (!data) {
      await mentormodel.create(req.body);
      var response = await mentormodel.find();
      res.status(200).send(response);
    } else {
      res.status(400).send("this mentor already exists");
    }
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------
// 2.   creating a student

// req.body must be in the below format
// {
//   "studentname":"rasanth",
//   "mentor":"divya"
// }

app.post("/createstudent", async (req, res) => {
  try {
    var data = await studentmodel.findOne({
      studentname: req.body.studentname,
    });
    if (!data) {
      if (req.body.mentor == "") {
        req.body.mentorassigned = false;
        await studentmodel.create(req.body);
        var response = await studentmodel.find();
        res.status(200).send(response);
      } else {
        req.body.mentorassigned = true;
        await studentmodel.create(req.body);
        var response = await studentmodel.find();
        res.status(200).send(response);
      }
    } else {
      res.status(400).send("this student already exists");
    }
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------
// 3. Write API to Assign a student to Mentor
//    * Select one mentor and Add multiple Student
//    * A student who has a mentor should not be shown in List

// req.body must be in the below format

// {
//   "studentnames":["prakash", "praveen"],
//   "mentorname": "divya"
// }

app.put("/assignstudents", async (req, res) => {
  try {
    var selectedmentor = await mentormodel.findOne({
      mentorname: req.body.mentorname,
    });

    selectedmentor.studentsassigned.push(...req.body.studentnames);
    await selectedmentor.save();

    req.body.studentnames.map(async (a) => {
      var selectedstudent = await studentmodel.findOne({
        studentname: a,
      });
      console.log(a);
      selectedstudent.mentor = req.body.mentorname;
      selectedstudent.mentorassigned = true;
      await selectedstudent.save();
    });

    var mentordata = await mentormodel.find();
    var studentdata = await studentmodel.find({ mentorassigned: false });
    res
      .status(200)
      .send({ mentors_available: mentordata, students_available: studentdata });
  } catch (error) {
    res.status(400).send(error);
  }
});



// ------------------------------------------------------------------------------------------------------------------------------------------------
// 4. Write API to Assign or Change Mentor for particular Student
//      *Select One Student and Assign one Mentor

// req.body must be in the below format

// {
//   "studentname": "rasanth",
//   "mentorname": "vishnu"
// }

app.put("/assignmentor", async (req, res) => {
  try {
    var selectedmentor = await mentormodel.findOne({
      mentorname: req.body.mentorname,
    });

    selectedmentor.studentsassigned.push(req.body.studentname);
    await selectedmentor.save();

    var selectedstudent = await studentmodel.findOne({
      studentname: req.body.studentname,
    });
    if (selectedstudent.mentor != "") {      
      selectedstudent.previousmentor = selectedstudent.mentor;
      var selectedmentor = await mentormodel.findOne({
        mentorname: selectedstudent.previousmentor,
      });

      selectedmentor.studentsassigned.splice(selectedmentor.studentsassigned.indexOf(req.body.studentname), 1)
      await selectedmentor.save();

      selectedstudent.mentor = req.body.mentorname;
      selectedstudent.mentorassigned = true;
      await selectedstudent.save();
    } else {
      selectedstudent.mentor = req.body.mentorname;
      selectedstudent.mentorassigned = true;
      await selectedstudent.save();
    }

    var mentordata = await mentormodel.find();
    var studentdata = await studentmodel.find({ mentorassigned: false });
    res
      .status(200)
      .send({ mentors_available: mentordata, students_available: studentdata });
  } catch (error) {
    res.status(400).send(error);
  }
});

// -------------------------------------------------------------------------------------------------------------------------------------------------

//5. Write API to show all students for a particular mentor
//
// the url must be in the below form, It must contain params (i.e. mentor name)
// http://localhost:9000/getstudentsofmentor/divya

app.get("/getstudentsofmentor/:mentorname", async (req, res) => {
  try {
    var { mentorname } = req.params;
    var selectedmentor = await mentormodel.findOne({
      mentorname: mentorname,
    });
    res.status(200).send(selectedmentor.studentsassigned);
  } catch (error) {
    res.status(400).send(error);
  }
});

// ---------------------------------------------------------------------------------------------------------------------------------------------

//6. Write an API to show the previously assigned mentor for a particular student.


// the url must be in the below form, It must contain params (i.e. student name)

//http://localhost:9000/studentswithpreviousmentor/prakash

app.get("/studentswithpreviousmentor/:studentname",async(req,res)=>{
  try {
    var {studentname}=req.params;
    var selectedstudent=await studentmodel.findOne({studentname:studentname});
    if(selectedstudent.previousmentor==""){
      res.status(200).send("No previous mentor")
    }else{
      res.status(200).send(selectedstudent.previousmentor)
    }
    
  } catch (error) {
    res.status(400).send(error);
  }

})


// -----------------------------------------------------------------Extras--------------------------------------------------------------------------------



// get all students without mentor
app.get("/studentswithoutmentor", async (req, res) => {
  try {
    var data = await studentmodel.find({ mentorassigned: false });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

// to get all students without mentor and mentor details
app.get("/mentor/students", async (req, res) => {
  try {
    var mentordata = await mentormodel.find();
    var studentdata = await studentmodel.find({ mentorassigned: false });
    res.status(200).send({ mentors: mentordata, students: studentdata });
  } catch (error) {
    res.status(400).send({ message: error });
  }
});

// -------------------------------------------------------------------------------------------------------------------------------------------------

app.listen(9000);
