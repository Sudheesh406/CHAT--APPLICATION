const {newUser,renderHome,loginPageRender,logout,login} = require('../controlls/userControll')

const auth = require('../middleware/authentication')
const express = require('express')
const router = express.Router()

router.get('/logout',logout)
router.get('/login',loginPageRender)

router.get('/signup',(req,res)=>{
    res.render('createAccount')
})

router.get('/',auth,renderHome)
router.post('/signup',newUser)

router.post('/login',login)


module.exports = router; 