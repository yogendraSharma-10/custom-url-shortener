const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

/**
 * @function connectDB
 * @description Establishes a connection to the MongoDB database using Mongoose.
 *              It retrieves the MongoDB URI from environment variables.
 *              Includes robust error handling and best practices for connection.
 */
const connectDB = async () => {
  try {
    // Ensure MONGO_URI is set in environment variables
    if (!process.env.MONGO_URI) {
      console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
      process.exit(1); // Exit process with failure code
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Recommended options for Mongoose 6+ to avoid deprecation warnings
      // useNewUrlParser: true, // Deprecated in Mongoose 6, default true
      // useUnifiedTopology: true, // Deprecated in Mongoose 6, default true
      // useCreateIndex: true, // Deprecated in Mongoose 6, default true
      // useFindAndModify: false, // Deprecated in Mongoose 6, default false
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // For replica sets or sharded clusters, you might add more options like:
      // replicaSet: 'rs0',
      // authSource: 'admin',
      // user: process.env.DB_USER,
      // pass: process.env.DB_PASS,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Optional: Log database name for clarity, especially in microservice context
    console.log(`Connected to database: ${conn.connection.name}`);

    // Mongoose connection event listeners for better monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose default connection open');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure code if initial connection fails
    process.exit(1);
  }
};

module.exports = connectDB;