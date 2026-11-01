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
const studioCollection = db.collection("stideos-data");
const bookingCollection = db.collection("booking-studios");

// auth middleware
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const { payload } = await jwtVerify(token, JWKS);

    req.user = {
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).send({
      message: "Invalid or expired token!",
    });
  }
};

// all get api
app.get("/", (req, res) => {
  res.send("server is runings");
});
// get api for studeios -data all
app.get("/studios", async (req, res) => {
  const data = await studioCollection.find().toArray();
  res.send(data);
});
// one data for
app.get("/studios/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await studioCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});
// my bookings api
app.get("/my-bookings/:email", verifyToken, async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const bookings = await bookingCollection
      .find({ userEmail: email })
      .toArray();

    return res.status(200).send({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
});
// studio limit api
app.get("/studios-limit", async (req, res) => {
  const data = await studioCollection.find().limit(6).toArray();
  res.send(data);
});
// my listing api
app.get("/my-listings/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const result = await studioCollection.find({ userEmail: email }).toArray();
  res.send(result);
});

// category api count
app.get("/studios/categories/count", async (req, res) => {
  try {
    const categories = await db
      .collection("stideos-data")
      .aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Category count error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category counts",
    });
  }
});

//all post api
app.post("/add-studios", verifyToken, async (req, res) => {
  const data = req.body;
  const result = await studioCollection.insertOne(data);
  res.send(result);
});
// booking post api
app.post("/bookings-studios", verifyToken, async (req, res) => {
  try {
    const data = req.body;

    const { studioId, studioTitle, userEmail } = data;

    if (!studioId || !userEmail || !studioTitle) {
      return res.status(400).send({
        success: false,
        message: "Studio and user information are required.",
      });
    }

    // Normalize email to prevent case-sensitive duplicates
    const normalizedEmail = userEmail.trim().toLowerCase();

    // Check if this user already has an active booking
    const existingBooking = await bookingCollection.findOne({
      studioId: String(studioId),
      userEmail: normalizedEmail,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (existingBooking) {
      return res.status(409).send({
        success: false,
        message: "You have already booked this studio.",
      });
    }

    const bookingData = {
      ...data,
      studioId: String(studioId),
      userEmail: normalizedEmail,
      status: "Pending",
      bookingDate: new Date().toISOString(),
    };

    const result = await bookingCollection.insertOne(bookingData);

    return res.status(201).send({
      success: true,
      message: "Studio booked successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    // MongoDB duplicate-key protection
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "You have already booked this studio.",
      });
    }

    console.error("Booking creation error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to create booking.",
    });
  }
});

//all delete api
app.delete("/bookings-studios/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const result = await bookingCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to delete booking.",
    });
  }
});

// user own listing delete api
app.delete("/my-listings/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await studioCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Listing not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete listing error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to delete listing.",
    });
  }
});

// all patch api
app.patch("/my-listings/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid listing ID.",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "hourlyRate",
      "securityDeposit",
      "maxCapacity",
      "location",
      "imageUrl",
      "amenities",
      "overview",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        success: false,
        message: "No fields provided to update.",
      });
    }

    const result = await studioCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Listing not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Listing updated successfully.",
      modified: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Update listing error:", error);

    return res.status(500).send({
      success: false,
      message: "Failed to update listing.",
    });
  }
});

app.listen(port, () => {
  console.log(`server app listening on port ${port}`);
});

export default app;
