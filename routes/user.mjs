import express from "express";
import db from "../db/conn.mjs";  // Your MongoDB connection
import bcrypt from "bcrypt";      // For password hashing
import jwt from "jsonwebtoken";   // For token generation
import ExpressBrute from "express-brute"; // For brute force protection
import helmet from "helmet";  // Set security-related HTTP headers
import rateLimit from "express-rate-limit"; // Rate limiting
import xss from "xss-clean"; // Prevent XSS

const router = express.Router();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

// Security Middleware for user routes
router.use(helmet());
router.use(xss());

// Rate limiting to prevent DDoS on signup and login
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
});
router.use(userLimiter);

// Regex to disallow characters used in injection attacks
const nameRegex = /^[a-zA-Z0-9_]+$/;

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        // Check if name and password are provided
        if (!req.body.name || !req.body.password) {
            return res.status(400).json({ message: "Name and password are required." });
        }

        // Validate name using regex
        if (!nameRegex.test(req.body.name)) {
            return res.status(400).json({ message: "Invalid characters in name." });
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user object
        let newUser = {
            name: req.body.name,
            password: hashedPassword,
        };

        // Insert the user into the database
        let collection = await db.collection("users");
        let result = await collection.insertOne(newUser);

        // Respond with success message and new userId
        res.status(201).json({ message: "User created", userId: result.insertedId });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: "Internal server error during signup" });
    }
});

// Login Route
router.post("/login", bruteforce.prevent, async (req, res) => {
    const { name, password } = req.body;

    try {
        // Check if the name and password are provided
        if (!name || !password) {
            return res.status(400).json({ message: "Name and password are required." });
        }

        // Validate name using regex
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: "Invalid characters in name." });
        }

        // Find the user in the database
        const collection = await db.collection("users");
        const user = await collection.findOne({ name });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { username: user.name },  // Token payload (user info)
            process.env.JWT_SECRET || "this_secret_should_be_longer_than_it_is",  // Secret from .env or default
            { expiresIn: "1h" }  // Token expiration time (1 hour)
        );

        // Log the generated token in the terminal
        console.log("Your new token is:", token);  // <-- This line logs the token

        // Respond with the token
        res.status(200).json({ message: "Login successful", token: token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error during login" });
    }
});

export default router;
