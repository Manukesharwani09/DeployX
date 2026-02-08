import express from "express";
import dotenv from "dotenv";

dotenv.config();
import cors from "cors";
import path from "path";
import fs from "fs";
import { simpleGit } from "simple-git";

import { generate } from "./utils.js";
import { fileURLToPath } from "url";
import { getAllFiles } from "./file.js";
import { uploadFile } from "./aws.js";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

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
    const files = getAllFiles(targetDir);

    console.log(`📦 Found ${files.length} files to upload`);

    // Upload all files in parallel and wait for completion
    await Promise.all(
        files.map(async (file) => {
            const relativePath = file.slice(targetDir.length + 1).replace(/\\/g, '/');
            const s3Key = `output/${id}/${relativePath}`;
            console.log(`⬆️  Uploading: ${s3Key}`);
            try {
                await uploadFile(s3Key, file);
                console.log(`✅ Uploaded: ${s3Key}`);
            } catch (error) {
                console.error(`❌ Failed to upload ${s3Key}:`, error);
                throw error;
            }
        })
    );
    await publisher.set("health", "ok");
    console.log(await publisher.get("health"));

    publisher.lPush("build-queue", id);

    console.log(`🎉 All ${files.length} files uploaded successfully!`);
    res.json({ message: "Repository cloned and files uploaded successfully", id });

});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
