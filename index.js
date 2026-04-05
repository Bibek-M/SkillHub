const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const { authMiddleware } = require("./authMiddleware");
const { skillModel, userModel } = require("./models");

app.use(express.json());

//SIGNUP

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const userExist = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    return res.status(403).json({
      message: "User already exists",
    });
  }

  const newUser = await userModel.create({
    username,
    email,
    password,
  });

  res.json({
    message: "User created",
    id: newUser._id,
  });
});

//SIGNIN

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const validUser = await userModel.findOne({
    email,
    password,
  });

  if (!validUser) {
    return res.status(403).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      userid: validUser._id,
    },
    "secret123"
  );

  res.json({
    token,
  });
});

//CREATE SKILL

app.post("/createSkill", authMiddleware, async (req, res) => {
  const { skill } = req.body;

  const newSkill = await skillModel.create({
    skill: skill,
    userId: req.userid,
  });

  res.json({
    message: "Skill created",
    skill: newSkill,
  });
});

//DASHBOARD (GET ALL SKILLS)

app.get("/api/dashboard", authMiddleware, async (req, res) => {
  const skills = await skillModel.find({}).populate("userId", "username email");

  res.json({
    skills,
  });
});

//DELETE SKILL

app.delete("/skill/:id", authMiddleware, async (req, res) => {
  const skillId = req.params.id;

  const skill = await skillModel.findOne({
    _id: skillId,
    userId: req.userid,
  });

  if (!skill) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  await skillModel.deleteOne({
    _id: skillId,
  });

  res.json({
    message: "Skill deleted",
  });
});

//FrontEnd
app.get('/signup',(req,res)=>{
    res.sendFile(__dirname+"/frontend/signup.html")
})
app.get('/signin',(req,res)=>{
    res.sendFile(__dirname+"/frontend/signin.html")
})
app.get('/dashboard',(req,res)=>{
    res.sendFile(__dirname+"/frontend/dashboard.html")
})
app.get('/landing',(req,res)=>{
    res.sendFile(__dirname+"/frontend/landing.html")
})
app.get('/createskill',(req,res)=>{
    res.sendFile(__dirname+"/frontend/createskill.html")
})
app.listen(3000, () => {
  console.log("Running on Port 3000");
});