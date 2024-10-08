import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.ATLAS_URI;

if (!connectionString) {
    throw new Error("MongoDB connection string (ATLAS_URI) is missing from environment variables.");
}

const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let conn;
try {
    conn = await client.connect();
    console.log('mongoDB is CONNECTED!!! :)');
} catch (e) {
    console.error('Failed to connect to MongoDB', e);
    throw new Error('MongoDB connection failed');
}

let db = client.db("users"); // Adjust this database name according to your needs.

export default db;
