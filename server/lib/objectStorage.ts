import fs from 'fs';
import fetch from 'node-fetch';

// Get Replit Object Storage credentials from environment variables
const STORAGE_URL = process.env.STORAGE_URL || 'https://objectstorage.prod.replit.com';
const STORAGE_TOKEN = process.env.STORAGE_TOKEN;
const BUCKET_ID = process.env.BUCKET_ID || 'replit-objstore-f945c3eb-851b-40c9-a101-b3bdbdc28497';

/**
 * Uploads a file to Replit Object Storage
 * @param filePath Path to the file on disk
 * @param mimeType MIME type of the file
 * @param objectName Optional name for the object (defaults to filename)
 * @returns Public URL of the uploaded file
 */
export async function uploadToObjectStorage(
  filePath: string, 
  mimeType: string,
  objectName?: string
): Promise<string> {
  if (!STORAGE_TOKEN) {
    throw new Error('STORAGE_TOKEN environment variable not set');
  }

  // Read the file
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = objectName || filePath.split('/').pop() || 'file';
  
  try {
    // Upload to Replit Object Storage
    const response = await fetch(
      `${STORAGE_URL}/v1/buckets/${BUCKET_ID}/objects/${fileName}`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STORAGE_TOKEN}`,
          'Content-Type': mimeType
        },
        body: fileBuffer
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to upload to object storage: ${error}`);
    }

    const data = await response.json() as { publicUrl: string };
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading to object storage:', error);
    throw error;
  }
}

/**
 * Deletes a file from Replit Object Storage
 * @param objectName Name of the object to delete
 */
export async function deleteFromObjectStorage(objectName: string): Promise<void> {
  if (!STORAGE_TOKEN) {
    throw new Error('STORAGE_TOKEN environment variable not set');
  }

  try {
    const response = await fetch(
      `${STORAGE_URL}/v1/buckets/${BUCKET_ID}/objects/${objectName}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${STORAGE_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete from object storage: ${error}`);
    }
  } catch (error) {
    console.error('Error deleting from object storage:', error);
    throw error;
  }
}