const express = require('express');
const cors = require('cors');
require('dotenv').config();
const SSLCommerzPayment = require('sslcommerz-lts')
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

const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false //true for live, false for sandbox

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogCollection = client.db("blogsDB").collection("blogs");
    const blogCommentCollection = client.db("blogsDB").collection("blogsComments");
    const wishlistsCollection = client.db("blogsDB").collection("wishlists");
    const followersCollection = client.db("blogsDB").collection("followers");
    const commentsCollection = client.db("blogsDB").collection("comments");
    const packagesCollection = client.db("blogsDB").collection("packages");
    const usersCollection = client.db("blogsDB").collection("users");
    const paymentsCollection = client.db("blogsDB").collection("payments");
    const notificationsCollection = client.db("blogsDB").collection("notifications");

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
    app.get('/blogs/time', async (req, res) => {
      const cursor = blogCollection.find().sort({ postDate: -1 })
      const result = await cursor.toArray();
      res.send(result);
    })


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

    app.put('/blogs/update/:id', async (req, res) => {
      const id = req.params.id;
      const blog = req.body;
      console.log(id, blog);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBlog = {
        $set: {
          title: blog.title,
          imgLink: blog.imgLink,
          shortDescription: blog.shortDescription,
          longDescription: blog.longDescription,

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
      const query = { _id: new ObjectId(id) }
      const result = await wishlistsCollection.deleteOne(query)
      res.send(result)
    })
    // followers
    app.get('/followers', async (req, res) => {
      const cursor = followersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // Dynamic Comment Api start------------------------



    app.get('/comments', async (req, res) => {
      let query = {};
      console.log(req.query)
      if (req.query?.videoId) {
        query = { videoId: req.query.videoId }
      }
      const cursor = commentsCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      console.log(result)
      res.send(result);
    })

    app.post('/comments', async (req, res) => {
      const newComment = req.body;
      console.log(newComment)
      const result = await commentsCollection.insertOne(newComment);
      res.send(result)
    })

    app.patch('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const updateComment = req.body;
      console.log(id, updateComment);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBlog = {
        $set: {
          body: updateComment.body,
        }
      }
      const result = await commentsCollection.updateOne(filter, updateBlog, options);
      res.send(result);
    })

    app.delete('/comments/:id', async (req, res) => {
      const id = req.params.id;
      console.log('from data base', id)
      const query = { _id: new ObjectId(id) }
      const result = await commentsCollection.deleteOne(query)
      res.send(result)
    })

    //like button
    app.patch('/comment/like', async (req, res) => {

      // const commentLike = req.body;
      // console.log(commentLike.like._id);
      if (req.body.like.parentId === "null") {
        const filter = { _id: new ObjectId(req.body.like?._id) };
        const updateLike = { $push: { like: req.body.like.userLike } }

        console.log(req.body.like.userLike)
        const result = await commentsCollection.updateOne(filter, updateLike);
        console.log(result)
        res.send(result);
      }
      else {
        const filter = { _id: new ObjectId(req.body.like?._id) };
        const updateLike = { $push: { like: req.body.like.userLike } }

        console.log(req.body.like.userLike)
        const result = await commentsCollection.updateOne(filter, updateLike);
        console.log(result)
        res.send(result);
      }

    })


    //DisLike button
    app.patch('/comment/dislike', async (req, res) => {

      // const commentLike = req.body;
      // console.log(commentLike.like._id);
      if (req.body.dislike.parentId === "null") {
        const filter = { _id: new ObjectId(req.body.dislike?._id) };
        const updateDislike = { $pull: { like: req.body.dislike.userDislike } }
        console.log(req.body.dislike.userDislike)
        const result = await commentsCollection.updateOne(filter, updateDislike);
        console.log(result)
        res.send(result);
      }
      else {
        const filter = { _id: new ObjectId(req.body.dislike?._id) }
        const updateDislike = { $pull: { like: req.body.dislike.userDislike } }
        console.log(req.body.dislike.userDislike)
        const result = await commentsCollection.updateOne(filter, updateDislike);
        console.log(result)
        res.send(result);
      }

    })

    // Dynamic Comment Api End------------------------


    // Package Data Start--------------------------------------

    app.get('/packages', async (req, res) => {
      const cursor = packagesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/packages/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await packagesCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })



    app.post('/payment', async (req, res) => {
      const packageData = await packagesCollection.findOne({ _id: new ObjectId(req.body?._id) })
      const tran_id = new ObjectId().toString();
      const data = {
        total_amount: packageData?.price,
        currency: 'BDT',
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: (`http://localhost:5000/payment/success/${tran_id}?packageData=${packageData?.packageName}&email=${req.query?.email}`),
        fail_url: `http://localhost:5000/payment/fail/${tran_id}`,
        cancel_url: `http://localhost:5000/payment/cancel/${tran_id}`,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'demo',
        cus_email: 'test@gmail.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };

      try {
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
          //   // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL
          res.send({ url: GatewayPageURL })
          // console.log('Redirecting to: ', { url: GatewayPageURL })
        });
      } catch (error) {
        console.log('error', error)
      }
      // store in payments collection
      const finalData = {
        paymentDate: new Date(),
        package: packageData?.packageName,
        isPayment: true,
        transactionId: tran_id,
        email: req?.query?.email,
        bank: 'SSLCommerz',
        mobile: '01711111111',
        amount: packageData?.price,
        paymentType: 'netBanking',
      }
      const paymentCollect = await paymentsCollection.insertOne(finalData);

      // if user success payment then hit this route
      app.post('/payment/success/:tranId', async (req, res) => {
        const filter = { email: req.query?.email };
        const updateBlog = {
          $set: {
            packagePurchaseDate: new Date(),
            package: req.query.packageData,
            isPayment: true,
            transactionId: req.params.tranId
          }
        }
        const result = await usersCollection.updateOne(filter, updateBlog);
        if (result.modifiedCount > 0) {
          res.redirect(
            `http://localhost:3000/subscribe/success/${req.params.tranId}`
          )
        }
      });
      // if user success function End

      // if user fail function
      app.post('/payment/fail/:tranId', async (req, res) => {
        const tranId = req.params.tranId
        console.log(tranId)
        const query = { transactionId: tranId }
        const result = await paymentsCollection.deleteOne(query)
        console.log(result)
        if (result.deletedCount > 0) {
          res.redirect(
            `http://localhost:3000/subscribe/fail/${req.params.tranId}`
          )
        }
      })

      // if user cancel function
      app.post('/payment/cancel/:tranId', async (req, res) => {
        const tranId = req.params.tranId
        console.log('cancel', tranId)
        const query = { transactionId: tranId }
        const result = await paymentsCollection.deleteOne(query)
        console.log('cancel', result)
        if (result.deletedCount > 0) {
          res.redirect(
            `http://localhost:3000/subscribe/fail/${req.params.tranId}`
          )
        }
      })

    });

    // Package Data End------------------------------

    //payment data Start

    app.get('/payments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { transactionId: id }
      // console.log(id)
      const result = await paymentsCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })

    //payment data End


    // Notification start-------------------


    app.get('/notifications', async (req, res) => {
      const query = req.query?.email;
      const checkUser = notificationsCollection.find({ openNotify: { $ne: query } })
      const result = await checkUser.toArray();
      res.send(result);
    })

    app.get('/notifications/read', async (req, res) => {
      const query = req.query?.email;

      const checkUser = notificationsCollection.find({ type: { $in: ["video", "message"] } }).sort({ notifyPostTime: -1 });
      const result = await checkUser.toArray();
      res.send(result);
    });


    // testing post data , production level remove this or video notify post method
    app.post('/notifications', async (req, res) => {
      const notify = req.body;
      const result = await notificationsCollection.insertOne(notify);
      res.send(result)
    })

    app.patch('/notifications/openNotify', async (req, res) => {
      const query = req.query?.email;
      const filter = { openNotify: { $ne: query } }
      const updateOpen = { $push: { openNotify: query } }
      const result = await notificationsCollection.updateMany(filter, updateOpen);
      res.send(result);
    });
    app.patch('/notifications/completeRead/:id', async (req, res) => {
      const id = req.params.id;
      const query = req.query?.email;
      const filter = { _id: new ObjectId(id), readeNotify: { $ne: query } }
      const updateCompleteRead = { $push: { readeNotify: query } }
      console.log(updateCompleteRead, id, query)
      const result = await notificationsCollection.updateOne(filter, updateCompleteRead);
      console.log(result)
      res.send(result);
    });


    // notification End---------------------





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