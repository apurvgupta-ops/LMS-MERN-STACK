import { app } from "./app";
import connectDb from "./utils/db";
require("dotenv").config();

const PORT = process.env.PORT;

// * CREATE SERVER
app.listen(PORT, () => {
  console.log(`server is connected to port ${PORT}`);
  connectDb();
});
