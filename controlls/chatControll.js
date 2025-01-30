const mongoose = require('mongoose');
const chat = require('../models/chatSchema')
const allMessage= require('../models/msgSchema')

async function userDetails(req,res) {
 let activeUser = req.User.id
  console.log("activeUser:",activeUser);
  return res.status(200).json(activeUser)
}

const createChat = async (req, res) => {  
  try {
    const receiverId = req.body.id; 
    const loginUserId = req.User.id; 

    if (loginUserId && receiverId ) {
      const isExist = await chat.findOne({
        users: { $all: [loginUserId, receiverId] },
      });
      if (isExist) {
        console.log("Private chat exists:", isExist);
        const messages = await allMessage.find({ chatId: isExist._id });
        console.log(messages,"messages");
        
        return res.status(201).json({
          id: isExist._id,
          messages: messages || [],
        });
      }
    }
      const newChat = await chat.create({
        users: [new mongoose.Types.ObjectId(loginUserId), new mongoose.Types.ObjectId(receiverId)],
      });

      if (newChat) {
        console.log("New private chat created successfully.");
        return res.status(201).json({ id: newChat._id, messages: [] });
      } else {
        console.error("Failed to create a new private chat.");
        return res.status(500).json({ error: "Failed to create private chat." });
      }

  } catch (error) {
    console.error("Error in creating chat details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



async function saveMessages(req,res){
  let senderId = req.User.id
  let content = req.body.content
  let id = req.body.id
  console.log("senderId: ",senderId,"content: ",content,"id:",id);
  try {
    let result = await allMessage.create({chatId : id,senderId : senderId,content:content})
    if(result){
      console.log("message created successfully...",result);
      res.status(201).json({message:result.content})
    }
  } catch (error) {
    console.error("error found in meessage saving",error);
    
  }
}

async function groupDetails(req,res) {
  let activeUser = req.User.id
  let GroupIds = req.body.ids
  let GroupName = req.body.gpNm
  GroupIds.push(activeUser)
  try {
    const isExist = await chat.findOne({name:GroupName});
      if(isExist){
        console.log('isExist:',isExist);
          const messages  = await allMessage.find({chatId:isExist._id})
          if(messages){
              res.status(201).json({id:isExist._id,messages})
          }else{
              res.status(201).json({id:isExist._id})
          }
          console.log("allready existed...");
      }else{
    let newChat = await chat.create({name:GroupName,isGroupChat:true,users:GroupIds,})
    if(newChat){
        console.log('newchat created successfully...');
        res.status(201).json({group: newChat})
        console.log("newChat :",newChat);
        
    }else{
        console.error('error found in create newChat');
        
    }
  }
  } catch (error) {
    console.error("error found in chat creating...",error);
    
  }
}

async function groupChatId(req,res) {
  let {groupName} = req.body
  console.log("groupName :",groupName);
  let isExist = await chat.findOne({name:groupName,isGroupChat:true});
  console.log("name:",groupName);
  if (isExist) {
    res.status(201).json({id:isExist._id})
    console.log("isExist:",isExist);
  }else{
    console.log("it is not found....");
    
  }
}

async function displayGroups(loginUser) {
  try {
    console.log("Finding groups for user:", loginUser); 
    let allGroups = await chat.find({
      isGroupChat: true,
      users: { $in: [new mongoose.Types.ObjectId(loginUser)] },
    });
    console.log("Groups found:", allGroups); 
    return allGroups;
  } catch (error) {
    console.error("Error in displayGroups:", error); 
    return [];
  }
}

async function findGPChat(req,res) {
  let  chatid = req.body.id
    console.log("chatId:",chatid);
    let result = await chat.findById({_id:chatid})
    console.log("result:",result);
    if(result){
      let messages = await allMessage.find({ chatId: chatid});
      if(messages)
        return res.status(201).json({
          id: result._id,
          users: result.users,
          messages: messages
        });
    }else{
      console.log("can't find a group...");
      
    }
  
}

module.exports = {userDetails,createChat,saveMessages,groupDetails,groupChatId,displayGroups,findGPChat}