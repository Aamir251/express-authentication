const express = require("express");
const app = express();
const mongoose = require('mongoose');
const routes = require("./routes/routes.js");
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + "/public"))
mongoose.connect("mongodb+srv://admin0251:aamir123@authentication-practise.io4jv.mongodb.net/SampleUsers?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => console.log("Connected to Database"));
mongoose.set('useFindAndModify', false);
app.get("/", routes)

app.get("/login", routes)
app.get("/register", routes)
app.post("/register", routes)
app.post("/login", routes)
app.post("/addmessage", routes)
app.post("/deletemessage", routes)

app.listen(PORT, () => console.log("Listening on Port " + PORT))