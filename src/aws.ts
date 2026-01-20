import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT,
  AWS_BUCKET_NAME,
} = process.env;

if (
  !AWS_ACCESS_KEY ||
  !AWS_SECRET_ACCESS_KEY ||
  !AWS_ENDPOINT ||
  !AWS_BUCKET_NAME
) {
  throw new Error("Missing required AWS environment variables");
}

// For Cloudflare R2, remove 'ID' prefix if present (R2 keys are 34 chars with prefix)
const accessKey = AWS_ACCESS_KEY.startsWith('ID') ? AWS_ACCESS_KEY.substring(2) : AWS_ACCESS_KEY;

const s3Client = new S3Client({
  region: "auto",
  endpoint: AWS_ENDPOINT,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
  });

  const response = await s3Client.send(command);
  return response;
};
