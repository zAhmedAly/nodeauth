const express = require("express");
const bodyParser = require("body-parser");

const user = require("./routes/user");

const MongoDB = require("./config/db");

require('dotenv').config();

const app = express();

// Initiate Mongo Server
MongoDB();

// PORT
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json({
        message: "Node Auth API",
        database: process.env.DB_URI,
        usage: 'User /api/auth/register & login'
    });
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/api/auth", user);

app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});