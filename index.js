const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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



    const toysCollection = client.db("battleZoneToys").collection("allToys");

    // const indexKeys = { title: 1 };
    // const indexOptions = { name: "ToyName" };
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // search all data by Toy name
    app.get("/searchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      if(searchText){
        const result = await toysCollection
        .find({
          $or: [
            {
              name: { $regex: searchText, $options: "i" },
            },
          ],
        })
        .limit(20)
        .toArray();
      res.send(result);
      }else{
        res.status(404).send({error:true,message:"Please do a valid query"})
      }
      
    });

    // get all data
    app.get("/allToys", async (req, res) => {
      //using limit
      // sorting
      const result = await toysCollection
        .find()
        .limit(20)
        .toArray();
      res.send(result);
    });

    // get data by id
    app.get("/allToys/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    //get data by email/user (My data)
    app.get("/myToys/:email", async (req, res) => {
      const email = req.params.email;
      const sortedBy = req.query.sort
      const result = await toysCollection
        .find({ sellerEmail: email })
        .sort({ createdAt: sortedBy })
        .limit(20)
        .toArray();
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

    //Post a toy
    app.post("/addAToy", async (req, res) => {
      const body = req.body;
      // console.log(body);
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });

    //update a toy
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToyData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = {
        $set: {
          price: updatedToyData.price,
          availableQuantity: updatedToyData.availableQuantity,
          detailDescription: updatedToyData.detailDescription,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    //delete a toy
    app.delete("/removeAToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
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
