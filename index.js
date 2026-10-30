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
const client = new MongoClient(mongobdurl);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongodbClient = await connectToMongoDB();
const db = mongodbClient.db("studio-space");
const studioCollection = db.collection("studio");

app.get("/", (req, res) => {
  res.send("server is runings");
});
app.post("/studios", async (req, res) => {
  const data = req.body;
  const result = await studioCollection.insertOne(data);
});

app.listen(port, () => {
  console.log(`server app listening on port ${port}`);
});

export default app;
