const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Force Mongoose to use the URI from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`); // This should say 'skillsphere'
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
