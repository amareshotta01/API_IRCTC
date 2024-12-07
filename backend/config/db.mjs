import mysql from 'mysql2/promise';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // replace with your MySQL password
      database: process.env.DB_NAME // replace with your database name
    });
    console.log("Connected to database.")
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error)
    throw error;
  }
};

export default connectDB;

