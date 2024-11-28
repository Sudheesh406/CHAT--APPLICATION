const socket = io();
let activeUser;
let chatId;
let GPchatId
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    alert("are you sure!");
    window.location.href = "/login";
  });

  const dropdownBtn = document.querySelector(".dropdown-btn");
  let value = true;
  dropdownBtn.addEventListener("click", () => {
    if (value) {
      document.getElementById("dropdown-menu").style.display = "block";
      value = false;
    } else if (!value) {
      document.getElementById("dropdown-menu").style.display = "none";
      value = true;
    }
  });
});
let receiverArray
let selectedContact;
let receiverId;
async function selectedUser(name, id) {
  receiverArray = null
  selectedContact = name;
  document.getElementById("message-input-container").style.display = "flex";
  document.getElementById("startAMsg").style.display = "none";
  if (selectedContact) {
    document.getElementById("selectedUser").innerText = selectedContact;
  }
  receiverId = id;
  if (receiverId) {
    let id = { id: receiverId };
    allChat(id);
  }
}

let selectedGPName
let receiverGroup
async function selectedGroup(name,id) {
  receiverId = id
  selectedGPName = name;
  document.getElementById("message-input-container").style.display = "flex";
  document.getElementById("startAMsg").style.display = "none";
  if (selectedGPName) {
    document.getElementById("selectedUser").innerText = selectedGPName;
  }
  GPchatId = id
  gpchat(id)
}

async function gpchat(data) {
  try {
    let id ={id:data}
    let response = await fetch("http://65.0.199.81:5000/chat/GpChat",{
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id),
    });      

    let result = await response.json()
    if(result){
      document.getElementById("messages_Ul").innerHTML = "";
            chatId = await result.id;
            receiverArray = await result.users
            let msg = await result.messages
            if(msg){
              msg.forEach((element) => {
                let li = document.createElement("li");
                li.innerText = element.content; 
                if (element.senderId == activeUser) {
                  li.classList.add("sender");
                } else {
                  li.classList.add("receiver");
                }
                 document.getElementById("messages_Ul").appendChild(li);
            });
          }
          }
      console.log("GroupChat posted successfully...");
  } catch (error) {
    console.error("error found in groupMessages...",error);
    
  }
}

async function allChat(data) {  
  try {
    let response = await fetch("http://65.0.199.81:5000/chat/createChat", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });        
        if (response) {
          let result = await response.json();          
          if (result) {
            document.getElementById("messages_Ul").innerHTML = "";
            chatId = await  result.id;
            let msg =  await result.messages
            
            if(msg){
                msg.forEach((element) => {
              if (element.senderId.toString() === activeUser.toString()) {
                let li = document.createElement("li");
                li.innerText = element.content;
                li.classList.add("sender");
                document.getElementById("messages_Ul").appendChild(li);
              } else {
                let li = document.createElement("li");
                li.innerText = element.content;
                li.classList.add("receiver");
                document.getElementById("messages_Ul").appendChild(li);
              }
            });
          }
          }
      console.log("privateChat posted successfully...");
    }
  } catch (error) {
    console.error("error found in chat creation", error);
  }
}

document.getElementById("send-button").addEventListener("click",async () => {
  let message = document.getElementById("message-input").value;
  document.getElementById("message-input").value = "";
  if (message) {
    let li = document.createElement("li");
    li.innerText = message;
    li.classList.add("sender");
    if(receiverId != GPchatId){
      document.getElementById("messages_Ul").appendChild(li);
      socket.emit("message & receiverId", { receiverId, message});
      messageSend(message, chatId);
  }
  if(receiverArray){
    document.getElementById("messages_Ul").appendChild(li);
    socket.emit("groupmessage", { receiverArray, message});
    receiverGroup = null
    messageSend(message, chatId);
  }
    }

});

async function messageSend(content, id) {
  let data = { content, id };
  try {
    let response = await fetch("http://65.0.199.81:5000/chat/msgSave", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    let result = await response.json();
    if (result) {
      console.log("message posted successfully...");
    }
  } catch (error) {
    console.error("error found in message posting....");
  }
}

socket.on("receiveMessage", (data) => {
  if (activeUser == data.receiverId) {
    if (receiverId == data.senderId) {
      let li = document.createElement("li");
      li.innerText = data.message;
      li.classList.add("receiver");
      document.getElementById("messages_Ul").appendChild(li);
    }
  }
});

socket.on("receiverArrayMessage", (data) => {
  data.array.forEach((element)=>{
    if (activeUser == element) {
      if(receiverId){
        if(receiverId == GPchatId){
          let li = document.createElement("li");
          li.innerText = data.message;
          li.classList.add("receiver");
          document.getElementById("messages_Ul").appendChild(li); 
        }
      } 
  }
  })
});


let close = true;
document.getElementById("new-group-btn").addEventListener("click", () => {
  if (close) {
    document.getElementById("group-creation").style.display = "flex";
    document.getElementById("new-group-btn").innerText = "X";
    close = false;
  } else if (!close) {
    document.getElementById("group-creation").style.display = "none";
    document.getElementById("new-group-btn").innerText = "NEW Group";
    close = true;
  }
});

async function userDetail() {
  try {
    let data = await fetch("http://65.0.199.81:5000/chat/userdetail");
    if (data) {
      activeUser = await data.json();
      socket.emit("userId", activeUser);
    }
  } catch (error) {
    console.error("error found in fetch userdetails :", error);
  }
}
userDetail();


let allName = []
let allId = []
function GroupMember(name ,id) {
  let result = allId.find((element)=>element == id)
  if(!result){
    allId.push(id)
    allName.push(name)
  }
  displayMembers()
}

function displayMembers(){
    document.getElementById('groupSelect').innerHTML=''
    allName.forEach((element)=>{
    document.getElementById('groupSelect').innerText += element + ","
  })
  
}

document.getElementById('createGroupBtn').addEventListener('click',()=>{
 let groupName =  document.getElementById('group-name').value
 document.getElementById('group-name').value =''
 if(groupName && allId.length >= 1){
   sendGroupDetails(groupName,allId)
   let li = document.createElement('li')
   li.classList.add("contact");
   li.innerText = groupName
   li.addEventListener('click',()=>{
   GroupChatId(groupName)
  document.getElementById("selectedUser").innerText = groupName
  document.getElementById("message-input-container").style.display = "flex";
  document.getElementById("startAMsg").style.display = "none";
})

 document.getElementById("contact-list").appendChild(li)
 }
 document.getElementById('group-creation').style.display='none'
 document.getElementById("new-group-btn").innerText = "NEW Group";
 close = true;
})

async function sendGroupDetails(gpNm,ids) {
  let data = {gpNm,ids}
  try {
    let response = await fetch("http://65.0.199.81:5000/chat/sendGPDtl",{
      method: 'post',
      headers: {
        "Content-Type": "application/json"  
      },
      body:JSON.stringify(data)
    })
    let result = await response.json()
    if(result){
      console.log("group details posted successfully...");
    }
    
  } catch (error) {
    console.error("error found in posting group details");
    
  }
}

async function GroupChatId (groupName) {
  let data = {groupName}
  try {
    let response = await fetch('http://65.0.199.81:5000/chat/groupchatId',{
      method:'post',
      headers:{
        "Content-Type": "application/json"
      },
      body:JSON.stringify(data)
    })
    let result = await response.json()
    if(result){
      chatId = result.id
      console.log("posted successfully for get groupChatId..");
    }
    
  } catch (error) {
    console.error("error found in groupChatId...");
    
  }
}