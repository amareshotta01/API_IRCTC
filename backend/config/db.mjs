import mysql from 'mysql2/promise';

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'amaresh2001', // replace with your MySQL password
      database: 'irctc' // replace with your database name
    });
    console.log("Connected to database.")
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error)
    throw error;
  }
};

export default connectDB;

