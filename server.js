const express = require('express');
const app = express()
require('dotenv').config();
const path = require('path');
const userRoute = require('./routers/userRoute');
const chatRoute = require('./routers/chatRoute')
const cookieParser = require('cookie-parser');
const connection = require('./database/db')

connection()

app.use(express.static(path.join(__dirname,'public')))  
app.use(express.urlencoded({extended : false}))
app.use(express.json())
   
app.set('view engine','ejs')
app.set('views',path.join(__dirname,"views"))
app.use(cookieParser())
app.use('/',userRoute)
app.use('/chat',chatRoute)

const port = process.env.PORT || 5000; 
let server = app.listen(port, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server running successfully on port ${port}...`);
    }
});


const io = require('socket.io')(server)
io.on('connection', (socket) => {
   console.log('A user connected...');
   let senderId;   
   socket.on('userId', (activeUser) => {
       senderId = activeUser;
       socket.join(activeUser);
       console.log("room created :",activeUser);
   });

   socket.on('message & receiverId',(data) => {
       const { receiverId,message} = data;
       console.log("data from sender:", data);
        io.to(receiverId).emit('receiveMessage', {  senderId, message, receiverId });       
   });
   socket.on('groupmessage',(data) => {
       const { receiverArray,message} = data;
       console.log("data from sender:", data);
       let array = receiverArray.filter((element)=>(element != senderId))
       array.forEach((element) => {
           io.to(element).emit('receiverArrayMessage', {  senderId, message, array});       
       });
   });


   socket.on('disconnect', () => {
       console.log('one user disconnected...')
   });
})