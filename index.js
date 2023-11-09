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
    const wishlistsCollection = client.db("blogsDB").collection("wishlists");
    const followersCollection = client.db("blogsDB").collection("followers");
    
    //get on blog
    app.get('/blogs', async (req, res) => {
        const cursor = blogCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/blogs/category', async (req, res) => {
      let query = {};
            console.log(req.query)
            if (req.query?.category) {
                query = { category: req.query.category }
            }
      const cursor = blogCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
  })
    // app.get('/blogs/time', async (req, res) => {       
    //     const cursor = blogCollection.find({
    //       timestamp: {
    //         $gte: new Date("2023-01-01T00:00:00.000Z"),
    //         $lt: new Date("2023-02-01T00:00:00.000Z")
    //       }
    //     })
    //     const result = await cursor.toArray();
    //     res.send(result);
    // })


    // app.get('/blogs/:name', async (req, res) => {
    //   const name = req.params.id;
    //   blogCollection.createIndex({ "title": "text" });
    //     const cursor = blogCollection.find({$text: { $search: name }});
    //     const result = await cursor.toArray();
    //     res.send(result);
    // })

    app.get('/blogs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        console.log(id)
        const result = await blogCollection.findOne(query)
        res.send(result)
    })

    app.put('/blogs/update/:id', async(req,res)=>{
      const id = req.params.id;
      const blog = req.body;
      console.log(id, blog);

      const filter = {_id: new ObjectId(id)};
      const options = {upsert:true};
      const updateBlog = {
          $set:{
            title:blog.title,
            imgLink:blog.imgLink,
            shortDescription:blog.shortDescription,
            longDescription:blog.longDescription,
            
          }
      }
      const result = await blogCollection.updateOne(filter, updateBlog, options);
      res.send(result);
  })

    //comment collection
    app.get('/blogsComments', async (req, res) => {
        const cursor = blogCommentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/blogsComments/:id', async (req, res) => {
        const id = req.params.id;
        const query = { commentId: id }
        console.log(id)
        const cursor = blogCommentCollection.find(query)
        const result = await cursor.toArray()
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

    //wishlist
    app.get('/wishlists', async (req, res) => {
      let query = {};
            console.log(req.query)
            if (req.query?.email) {
                query = { email: req.query.email }
            }
      const cursor = wishlistsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
  })
    app.post('/wishlists', async (req, res) => {
        const newWishlist = req.body;
        console.log(newWishlist)
        const result = await wishlistsCollection.insertOne(newWishlist);
        res.send(result)
    })
    app.delete('/wishlists/:id', async (req, res) => {
      const id = req.params.id;
      console.log('from data base', id)
      const query = {_id: new ObjectId(id)}
      const result = await wishlistsCollection.deleteOne(query)
      res.send(result)
  })
  // followers
  app.get('/followers', async (req, res) => {
    const cursor = followersCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})



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