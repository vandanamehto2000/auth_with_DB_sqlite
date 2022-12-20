const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const createDB = require("../config/db");
const User = require("../models/userModels");

const { validateName, validateEmail, validatePassword } = require("../utils/validators");

createDB.sync().then(() => {
    console.log("database is running");
});

// signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body; //destructuring name, email and password out of the request body
        console.log(name, email, password);
        const userExist = await User.findOne({
            where: {
                email
            }
        })

        if (userExist) {
            return res.status(403).send("User already exists"); //check if the user with the entered email already exists in the database
        }

        if (!validateName(name)) {
            // res.send("Invalid name")
            return res.status(400).send("Error: Invalid user name: name must be longer than two characters and must not include any numbers or special characters");
        }

        if (!validateEmail(email)) {
            return res.status(400).send("Error: Invalid email");
        }

        if (!validatePassword(password)) {
            return res.status(400).send("Invalid password: password must be at least 8 characters long and must include atlest one - one uppercase letter, one lowercase letter, one digit, one special character");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const saveToDB = {
            name, email, password: hashedPassword
        }
        const createdUser = await User.create(saveToDB)

        return res.status(201).send(createdUser);
    }
    catch (err) {
        console.log(err);
        return res.status(500).send(`Error: ${err.message}`);
    }

})

// signin
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body; //* destructuring email and password out of the request body
        console.log(email, password)

        if (email.length === 0) {
            return res.status(400).json({ message: "Error: Please enter your email" });
        }
        if (password.length === 0) {
            return res.status(400).json({ message: "Error: Please enter your password" });
        }

        const existingUser = await User.findOne({ where: { email: email } }); //* check if the user with the entered email exists in the database
        if (!existingUser) {
            return res.status(404).json({ message: "Error: User not found" });
        }

        //* hashes the entered password and then compares it to the hashed password stored in the database
        const passwordMatched = await bcrypt.compare(password, existingUser.password
        );

        if (!passwordMatched) {
            return res.status(400).json({ message: "Error: Incorrect password" });
        }
        return res.status(200).json({ message: `Welcome to Devsnest ${existingUser.name}. You are logged in` });
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: `Error: ${err.message}` });
    }
});




module.exports = router;