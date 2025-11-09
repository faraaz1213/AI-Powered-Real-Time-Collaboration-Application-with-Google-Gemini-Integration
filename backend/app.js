import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import ai from './routes/ai.routes.js';
import cors from 'cors';

dotenv.config();
connect();

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai",ai)

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});


app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;
