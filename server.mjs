// server.mjs
import https from "https";
import express from "express";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import posts from "./routes/post.mjs";
import users from "./routes/user.mjs"; // This handles /signup and /login routes

dotenv.config(); // Load environment variables

const PORT = 3001;
const app = express();

// Load SSL certificates
const options = {
    key: fs.readFileSync('keys/privatekey.pem'),
    cert: fs.readFileSync('keys/certificate.pem')
};

// Security Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(cors()); // Enable CORS
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate limiting to prevent DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());  // Parse JSON request bodies

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Attach routes
app.use("/post", posts);  // Handles post-related routes
app.use("/user", users);  // Handles user signup and login routes from user.mjs

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});