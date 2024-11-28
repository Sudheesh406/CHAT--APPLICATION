const mongoose = require('mongoose');
async function connection() {
    try {
      mongoose.connect(process.env.MONGO_DB_URL)
      console.log("database connected...");
      
    } catch (error) {
        console.error("error found in database connection",error);
        
    }
}

module.exports = connection