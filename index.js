const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());


function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'unauthorized access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:'Forbidden access'});
        }
        console.log('decoded',decoded);
        req.decoded=decoded;
    })
    next();
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6r7dg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        await client.connect();
        const productCollection = client.db('Best-Buy-Bd').collection('products');
        const reviewCollections=client.db('Best-Buy-Bd').collection('reviews')

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        //reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollections.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
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
        app.put('/product/:id',async(req,res)=>{
            const id=req.params.id;
            const updatedProduct=req.body;
            const filter= {_id:ObjectId(id)};
            const options={upsert:true};
            const updatedDoc={
                $set:{
                    quantity:updatedProduct.quantity
                }
            };
            const result=await productCollection.updateOne(filter,updatedDoc,options);
            res.send(result);
        });
        
        //auth related
        app.post('/login',async(req,res)=>{
            const user=req.body;
            const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
                expiresIn:'1d'
            })
            res.send({accessToken});
        })

        //added product api
        app.get('/myproducts',verifyJWT,async(req,res)=>{
            const email=req.query.email;
            const decodedEmail=req.decoded.email;
           if(email===decodedEmail){
           
            console.log(email);
            const query={email:email};
            const cursor= productCollection.find(query);
            const myProducts= await cursor.toArray();
            res.send(myProducts);
           }
           else{
               res.status(403).send({message:'Forbidden access'})
           }
        })

        app.put('/product/:id',async(req,res)=>{
            const id=req.params.id;
            const updatedProduct=req.body;
            const filter= {_id:ObjectId(id)};
            const options={upsert:true};
            const updatedDoc={
                $set:{
                    quantity:updatedProduct.quantity
                }
            };
            const result=await productCollection.updateOne(filter,updatedDoc,options);
            res.send(result);
        });



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
