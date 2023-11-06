const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2fbewnn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogCollection = client.db("blogsDB").collection("blogs");
    const blogCommentCollection = client.db("blogsDB").collection("blogsComments");
    
    //get on blog
    app.get('/blogs', async (req, res) => {
        const cursor = blogCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/blogs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        console.log(id)
        const result = await blogCollection.findOne(query)
        res.send(result)
    })

    //post on blog 
    app.post('/blogs', async (req, res) => {
        const newBlogs = req.body;
        console.log(newBlogs)
        const result = await blogCollection.insertOne(newBlogs);
        res.send(result)
    })
    app.post('/blogs/comments', async (req, res) => {
        const newComment = req.body;
        console.log(newComment)
        const result = await blogCommentCollection.insertOne(newComment);
        res.send(result)
    })
    // app.get('/blogs')

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })