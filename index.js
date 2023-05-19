const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiktc6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db("battleZoneToys").collection("allToys");

    const indexKeys = { title: 1 };
    const indexOptions = { name: "ToyName" };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/searchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            {
              name: { $regex: searchText, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    // get all data
    app.get("/allToys", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    //get data by category
    app.get("/allToys/:category", async (req, res) => {
      const category = req.params.category;
      let result;
      if (
        category == "marvel" ||
        category == "starWars" ||
        category == "avengers"
      ) {
        result = await toysCollection.find({ subCategory: category }).toArray();
      } else {
        result = await toysCollection.find({}).toArray();
      }
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Battle Zone Toys server is running");
});
app.listen(port, () => {
  console.log("Battle Zone Toys server is running at", port);
});
