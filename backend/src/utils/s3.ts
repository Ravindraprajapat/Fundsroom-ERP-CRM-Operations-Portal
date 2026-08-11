import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import env from "../config/env.js";
import { s3 } from "../config/s3.js";

export const uploadToS3 = async (filename: string, buffer: Buffer, contentType: string): Promise<string> => {
  const cmd = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Body: buffer,
    Key: filename,
    ContentType: contentType,
  });
  try {
    console.log('S3 PutObjectCommand params:', {
      Bucket: env.AWS_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
      BodyLength: buffer?.length,
    });
    await s3.send(cmd);
    console.log('S3 PutObjectCommand sent successfully for', filename);
    return filename;
  } catch (err) {
    console.error('S3 PutObjectCommand failed for', filename, err);
    throw err;
  }
};

export const getFromS3 = async (filename: string, expiresIn = 600): Promise<string> => {
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: filename,
    }),
    { expiresIn }
  );
};