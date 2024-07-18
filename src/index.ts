import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import router from "./router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use('/', router());

app.get("/keep-alive", (req: Request, res: Response) => {
  res.send("Server is alive!");
});

const DB_NAME = process.env.DB_NAME;
const MONGO_URL = `${process.env.MONGO_URL}`;

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, {
    dbName: DB_NAME, // Specify the database name here
}).then(() => {
    console.log('[database] Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.listen(port, () => {
  console.log(`[server] Server is running at http://localhost:${port}`);
});