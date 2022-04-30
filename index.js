const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6r7dg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        await client.connect();
        const productCollection = client.db('Best-Buy-Bd').collection('products');

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id',async(req,res)=>{
            const id= req.params.id;
            const query={_id:ObjectId(id)};
            const product= await productCollection.findOne(query);
            res.send(product);
        });
        //post
        app.post('/product',async(req,res)=>{
            const newProduct=req.body;
            const result=await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //delete
        app.delete('/product/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result= await productCollection.deleteOne(query);
            res.send(result);
        });

        //PUT
        



    }
    finally {

    }
};
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Running server')
});

app.listen(port, () => {
    console.log('My server is running');
})
