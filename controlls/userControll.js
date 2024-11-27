const User = require('../models/userSchema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const {displayGroups} = require('../controlls/chatControll')

async function newUser(req,res){
  const {email, username, password} = req.body;
  console.log("req.body : ",req.body);
  
  try {
    const existingUser = await User.findOne({email:email})
    if(existingUser){
      console.log('user already created a account');
      return res.status(400).redirect("/signup")
    }else{
      const hashedPassword  = await bcrypt.hash(password, 10)
     let newUser =  await User .create({email, username, password:hashedPassword})
  
        let accessToken =  jwt.sign({
          id : newUser.id,
          email : newUser.email
        },process.env.SECRETKEY,{expiresIn:"24hr"})
    
      res.cookie('token',accessToken)
      console.log(" new user created");
      return res.redirect('/')  
    }
  } catch (error) {
    console.error(error,"error found in creating User");
  }
}

async function loginPageRender(req,res) {
  res.render('login')
}

async function login(req,res) {
  const {email, password} = req.body
  try {
    let acess = await User.findOne({email : email})
    if(!acess){
      console.log("User not found");
      return res.status(404).redirect("/login")
    }else{
      const correctPassword = await bcrypt.compare(password, acess.password);
      if(!correctPassword){
        console.log('incorrect password');
        return res.status(404).redirect("/login")
      }else{
        let acessToken = jwt.sign({
          id : acess.id,
          email:acess.email
        },process.env.SECRETKEY,{expiresIn:'24hr'})
        res.cookie('token',acessToken)
        console.log('user login successfully...');
        return res.redirect('/')
      }
    }
  } catch (error) {
    console.error(error,"error found in login");
    res.status(500).send("error login user")
  }
}

async function renderHome(req,res) {
  let userEmail = req.User.email
  let id = req.User.id
  console.log("user:",id);
  
  try {
      let groups = await displayGroups(id)
        let Array = await User.find()
        let contactArray = Array.filter((element)=>element.email != userEmail)
        let loginUser = Array.find((element)=>element.email === userEmail)
        let name = loginUser.username
        if(groups){
          res.render('home',{name,contactArray,groups})
        }else{
          res.render('home',{name,contactArray})
        }
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function logout(req,res){ 
    res.clearCookie('token')  
     return res.redirect('/login') 
     
  }

  

module.exports = {newUser,renderHome,loginPageRender,logout,login}