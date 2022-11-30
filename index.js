const express = require('express');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require ('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqsz8o8.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, 
  { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}




async function run(){
    try{ 
      const productCollection = client.db('resale-here').collection('laptops');
      const usersCollection = client.db('resale-here').collection('users');
      const addedProductsCollection = client.db('resale-here').collection('products');
      

      const verifyAdmin = async (req, res, next) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await usersCollection.findOne(query);
    
        if (user?.role !== 'admin') {
            return res.status(403).send({ message: 'forbidden access' })
        }
        next();
    }

        app.get('/laptops', async (req, res) => {
          // const date = req.query.date;
          const query = {};
          const options = await productCollection.find(query).toArray();
          res.send(options)
        })

        // added products get api
        app.get('/products', async (req, res) =>{
          const query = {};
          const products = await addedProductsCollection.find(query).toArray();
          res.send(products)

        })

        app.get('/users', async (req, res) => {
          // const date = req.query.date;
          const query = {};
          const options = await usersCollection.find(query).toArray();
          res.send(options)
        })

          // Save user email & generate JWT
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      console.log(result)

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      })
      console.log(token)
      res.send({ result, token })
    })
    app.put('/users', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options)
      console.log(result)

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      })
      console.log(token)
      res.send({ result, token })
    })

    // check admin 
    
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
  })


  // loading users and make admin 
  app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await usersCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
});

// temporary to update price field on appointment options
// app.get('/addPrice', async (req, res) => {
//     const filter = {}
//     const options = { upsert: true }
//     const updatedDoc = {
//         $set: {
//             price: 99
//         }
//     }
//     const result = await appointmentOptionCollection.updateMany(filter, updatedDoc, options);
//     res.send(result);
// })


app.post('/products', async (req, res) => {
  const product = req.body;
  const result = await addedProductsCollection.insertOne(product);
  res.send(result);
});
    }
    finally{

    }
}

run().catch(error => console.log(error));


app.get('/', (req, res) => {
  res.send('Hello World! resale here server is runing!!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${ port} `)
})