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

async function run(){
    try{ 
      const productCollection = client.db('resale-here').collection('laptops');
      const usersCollection = client.db('resale-here').collection('users');

        console.log("database connected");
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