const jwt = require('jsonwebtoken');
require('dotenv').config()
const chat = require('../models/chatSchema')


async function auth(req,res,next) {
    let token = req.cookies?.token
    if(!token){
       return res.redirect('/login')
    }else{
        try {
            let user = jwt.verify(token,process.env.SECRETKEY);
            if(user){
                req.User = user; 
                next()
            }else{
                res.redirect('/login')
            }           
        } catch (error) {  
            console.error(error,"authentication found some error");
            return res.redirect('/login');
        }
    }
}



module.exports = auth