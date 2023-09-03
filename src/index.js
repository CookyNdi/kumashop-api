import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

app.listen(port, () => {
  console.log(`server running perfectly at port ${port}`);
});
