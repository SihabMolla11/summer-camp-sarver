const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY);
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
        const selectedClassesCollection = client.db('Summercamp').collection('SelectedClasses')
        const paymentCollection = client.db('Summercamp').collection('Payments')


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

        // get All Users
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        });

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

        // get all classes
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
        });

        // gea a class by a id
        app.get("/singleClass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.findOne(query);
            res.send(result)
        });

        // get instructors
        app.get("/instructors", async (req, res) => {
            const role = req.query?.role
            if (!role === "instructors") {
                res.send([])
            }
            let query = {}
            if (role) {
                query = { role: role }
            }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        });

        // updata class
        app.put("/singleClass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const newClass = req.body;
            const updateClass = {
                $set: newClass

            }
            const result = await classCollection.updateOne(query, updateClass)
            res.send(result)
        });


        // Selected class add
        // app.post("/selectedClasses", async (req, res) => {
        //     const newClass = req.body;
        //     const query = { Classid: newClass.Classid, email: newClass.email }
        //     const ExistingUser = await selectedClassesCollection.findOne(query)
        //     if (ExistingUser) {
        //         res.send({ message: "the class allrady existing" })
        //     }
        //     else {
        //         const result = await selectedClassesCollection.insertOne(newClass)
        //         res.send(result)
        //     }
        // });

        app.post("/selectedClasses", async (req, res) => {
            const newClass = req.body;
            const result = await selectedClassesCollection.insertOne(newClass)
            res.send(result)
        });

        // get selected class
        app.get("/selectedClasses", async (req, res) => {
            const email = req.query?.email
            // console.log(email)
            let query = {}
            if (email) {
                query = { email: email }
            }
            const result = await selectedClassesCollection.find(query).toArray()
            res.send(result)
        });

        // delete selectd class
        app.delete("/stlClass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedClassesCollection.deleteOne(query);
            res.send(result);
        });

        // get selected class by id
        app.get("/selectedClass/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await selectedClassesCollection.findOne(query)
            res.send(result)
        });

        // create payment intent
        app.post("/payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = price * 100;
            // console.log(price, amount)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        });


        // Payment data post
        app.post("/payments", async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment)
            const query = { Classid: payment.Classid }
            // console.log(query)
            const deleteResult = selectedClassesCollection.deleteMany(query)
            res.send({ result, deleteResult })
        });

        // get payment information
        app.get("/payments", async (req, res) => {
            let query = {}
            const email = req.query.email
            console.log(email)
            if (email) {
                query = { email: email }
            }
            const result = await paymentCollection.find(query).toArray()
            res.send(result)
        });








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
});