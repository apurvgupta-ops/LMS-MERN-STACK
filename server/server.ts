require("dotenv").config();
import { app } from "./app";
import connectDb from "./utils/db";
import { v2 as cloudinary } from "cloudinary";

const PORT = process.env.PORT;

// *ClOUDINARY CONNECTION
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// * CREATE SERVER
app.listen(PORT, () => {
  console.log(`server is connected to port ${PORT}`);
  connectDb();
});
