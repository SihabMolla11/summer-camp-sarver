const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('last section server sight is runnit for this coges I am very happy')
});




// mongodb code start
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.SUMMER_CAMP_USER}:${process.env.SUMMER_CAMP_PASSWORD}@cluster0.pphnrsn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useUnifiedTopology: true }, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1 });

async function run() {
    try {
        // await client.connect();
        const usersCollection = client.db('Summercamp').collection('Users')
        const classCollection = client.db('Summercamp').collection('Classes')


        // user collections
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const isExistingUser = await usersCollection.findOne(query);
            if (isExistingUser) {
                return res.send({ message: "this user allrady exist" })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        });

        // get Users
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })

        // instuctor user
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email: email }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result)
        });

        // get a instructor
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email)
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        });


        // add class
        app.post("/classes", async (req, res) => {
            const newClass = req.body;
            const result = await classCollection.insertOne(newClass)
            res.send(result)
        });

        // delete my class
        app.get("/allClasses", async (req, res) => {
            const result = await classCollection.find().toArray()
            res.send(result)
        });

        // get my classes
        app.get("/my-classes", async (req, res) => {
            const email = req.query?.email
            let query = {}
            if (email) {
                query = { email: email }
            }
            const result = await classCollection.find(query).toArray()
            res.send(result)
        });

        // delete a class 
        app.delete("/allClasses/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.deleteOne(query)
            res.send(result)
        })








        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
// mongodb end


app.listen(port, () => {
    console.log(`summer camp sarver running ${port}`)
})