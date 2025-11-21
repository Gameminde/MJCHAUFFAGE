import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.storage.endpoint,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
});

export class StorageService {
  /**
   * Upload a file to Cloudflare R2
   * @param file The file object from multer
   * @returns The public URL of the uploaded file
   */
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const key = `uploads/${uuidv4()}${fileExtension}`;

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: config.storage.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL is often not supported or needed for R2 depending on bucket settings, 
          // but generally R2 buckets are private by default with public access configured via custom domain or worker.
        },
      });

      await upload.done();

      // Construct public URL
      // Ideally, this should be a custom domain mapped to the R2 bucket for better performance and branding
      // For now, we'll use the public access URL if configured, or a placeholder that needs to be set in env
      const publicUrl = `${config.storage.publicUrl}/${key}`;
      
      logger.info(`File uploaded successfully to R2: ${key}`);
      
      return publicUrl;
    } catch (error) {
      logger.error('R2 Upload Error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete a file from Cloudflare R2
   * @param fileUrl The full URL of the file to delete
   */
  // Remove unused parameter warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
static async deleteFile(_fileUrl: string): Promise<void> {
  // Implementation for delete if needed
  // Extract key from URL and use DeleteObjectCommand
}
}

