require("dotenv").config();
import mongoose from "mongoose";

const dbURL: string = process.env.DB_URL || "";
const connectDb = async () => {
  try {
    await mongoose.connect(dbURL).then((data: any) => {
      console.log(`Connection successfully ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;
