const mongoose = require('mongoose');
async function connection() {
    try {
      mongoose.connect('mongodb://localhost:27017/chat')
      console.log("database connected...");
      
    } catch (error) {
        console.error("error found in database connection",error);
        
    }
}

module.exports = connection