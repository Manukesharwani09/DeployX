import express from "express";
import dotenv from "dotenv";

dotenv.config();
import cors from "cors";
import path from "path";
import fs from "fs";
import {simpleGit} from "simple-git";

import { generate } from "./utils.js";
import { fileURLToPath } from "url";
import { getAllFiles } from "./file.js";
import { uploadFile } from "./aws.js";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();

    const baseDir = path.join(__dirname, "output");
    const targetDir = path.join(baseDir, id);

    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }

    await simpleGit().clone(repoUrl, targetDir);
    const files=getAllFiles(targetDir);
    

    // files.forEach(file=>{
    //     S3.uploadFile(file,id);
    // })

    console.log(files);

    res.json({ message: "Repository cloned successfully", id });
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
