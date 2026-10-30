import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
app.use(cors());
app.use(express.json());

const port = 8000;

const mongobdurl = process.env.MONGODB_URL;

app.get("/", (req, res) => {
  res.send("server is runings");
});

app.listen(port, () => {
  console.log(`server app listening on port ${port}`);
});

export default app;
