import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.mjs";
import userRoute from "./routes/userRoute.mjs";
import adminRoute from "./routes/adminRoute.mjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {generateApiKey} from "./config/apiKeyGenerate.mjs";

dotenv.config();

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cookieParser());

app.listen(port, async () => {
  try {
    console.log(`Server running on port ${port}`);
    await connectDB();
  } catch (error) {
    console.error("Error in connecting to the database: ", error.message);
  }
});


app.use('/user', userRoute);
app.use('/admin', adminRoute);

// const apiKey = generateApiKey();
// console.log("Generated Api key2 : ",apiKey); //generate the api key by un-commenting these 2 lines of code and set it in the env file and use the code else the admin endpoints will not be able to be accessed.

app.get("/", (req, res) => {
  res.json("Backend");
});



