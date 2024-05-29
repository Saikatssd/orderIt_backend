const mongoose = require('mongoose');

function connectDatabase() {
  const DB_URI = process.env.DB_LOCAL_URI;

  // Connect to the MongoDB database using Mongoose
  mongoose.connect(DB_URI, {})
    .then((connection) => {
      console.log('MongoDB Database connected with HOST:', connection.connection.host);
    })
    .catch((error) => {
      console.error('Error connecting to the database:', error.message);
    });
}

module.exports = connectDatabase;
