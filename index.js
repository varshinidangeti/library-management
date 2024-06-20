const express = require('express');
const cors=require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const server = "127.0.0.1:27017";
const db = "signupdb";
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

mongoose.connect(`mongodb://${server}/${db}`)
    .then(() => {
        console.log("Database connection is successful");
    })
    .catch((error) => {
        console.error("Database connection failed: " + error);
    });

const authSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true }
});
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
  });
  
  const User = mongoose.model('User', userSchema);
const book = mongoose.model('book', bookSchema);
const Auth = mongoose.model('Auth', authSchema);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/addbook", (req, res) => {
    console.log("Received addbook request:", req.body);
    const newbook = new book({
        name: req.body.name,
        price: req.body.price,
        status: req.body.status
    });
    newbook.save()
        .then(() => {
            console.log("Book data saved to MongoDB");
            res.send("Book added successfully");
        })
        .catch((error) => {
            console.error("Error saving book data:", error);
            res.status(500).send("Error saving book data");
        });
});

app.post("/takebook", async (req, res) => {
    console.log("Received takebook request:", req.body);

    try {
        const bookReturns = await book.findOne({
            name: req.body.name,
            price: req.body.price,
            status: "available"
        });
        console.log("book found:",bookReturns)
        if (!bookReturns) {
            console.log("Book not found");
            return res.status(404).send("Book not found");
        }

        if (bookReturns.status !== "available") {
            console.log("Book is not available");
            return res.send("This book is not available");
        }

        console.log("Trying to send book and set status");
        bookReturns.status = "not available";
        await bookReturns.save();

        res.send("Book taken successfully");
    } catch (error) {
        console.error("Error taking book:", error);
        res.status(500).send("Error taking book");
    }
});
app.post("/returnbook", async (req, res) => {
    console.log("Received returnbook request:", req.body);

    try {
        const bookReturns = await book.findOneAndUpdate(
            {
                name: req.body.name,
                price: req.body.price,
                status: "not available"
            },
            { $set: { status: "available" } }, // Update status to "available"
            { new: true } // Return the updated document
        );
        

        console.log("Book found and updated:", bookReturns);

        if (!bookReturns) {
            console.log("Book not found or already available");
            return res.status(404).send("Book not found or already available");
        }

        console.log("Book status set to available");
        res.send("Book returned successfully");
    } catch (error) {
        console.error("Error returning book:", error);
        res.status(500).send("Error returning book");
    }
});


app.post("/deletebook", async (req, res) => {
    console.log("Received delete book request:", req.body);

    try {
        const deleteResult = await book.deleteOne({
            name: req.body.name,
            price: req.body.price,
            status: req.body.status
        });

        console.log("Delete result:", deleteResult);

        if (deleteResult.deletedCount === 0) {
            console.log("Book not found");
            return res.status(404).send("Book not found");
        }

        console.log("Book deleted successfully");
        res.send("Book deleted successfully");
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).send("Error deleting book");
    }
});
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    const newUser = new User({ username, password });
    try {
        await newUser.save();
        res.status(201).send(newUser);
      } catch (err) {
        res.status(500).send(err);
      }
    });
  
  

app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            console.log('user found:',user);
          res.status(200).send({ message: "Sign-in successful" });
        } else {
            console.log('invalid username or password');
          res.status(401).send({ message: "Invalid username or password" });
        }
      } catch (err) {
        console.log('error during sign-in:',err);
        res.status(500).send(err);
      }
    });
    
    

       

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
