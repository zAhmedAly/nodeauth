//FILENAME : db.js

const mongoose = require("mongoose");

const MongoDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB !! @ " + process.env.DB_URI);
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = MongoDB;