// post.mjs
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "bson";
import checkauth from "./check-auth.mjs";

const router = express.Router();

// Get all the records
router.get("/", async (req, res) => {
    let collection = await db.collection("posts");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
});

// Create a new record (Protected with checkauth middleware)
router.post("/upload", checkauth, async (req, res) => {
    let newDocument = {
        user: req.body.user,
        content: req.body.content,
        image: req.body.image
    };
    let collection = await db.collection("posts");
    let result = await collection.insertOne(newDocument);
    res.status(201).send(result);
});

// Update a record by id (Protected with checkauth middleware)
router.patch('/:id', checkauth, async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            name: req.body.name,
            comment: req.body.comment
        }
    };

    let collection = await db.collection("posts");
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);
});

// Gets a single record by id
router.get('/:id', async (req, res) => {
    let collection = await db.collection("posts");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.status(404).send("Not found");
    else res.status(200).send(result);
});

// Delete a record (Protected with checkauth middleware)
router.delete('/:id', checkauth, async (req, res) => {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("posts");
    let result = await collection.deleteOne(query);

    res.status(200).send(result);
});

export default router;