const express = require('express');
const router = express.Router()
const auth = require('../middleware/authentication')
const {userDetails,createChat,saveMessages,groupDetails,groupChatId,findGPChat} = require('../controlls/chatControll')

router.get('/userdetail',auth,userDetails)
router.post('/createChat',auth,createChat)
router.post('/msgSave',auth,saveMessages)
router.post('/sendGPDtl',auth,groupDetails)
router.post('/groupchatId',groupChatId)
router.post('/GpChat',findGPChat)



module.exports = router
                