import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

// The bucket name in Supabase
const DEFAULT_BUCKET = "property-images";

// How long the signed URL should be valid for (in seconds)
// 7 days = 604800 seconds
const SIGNED_URL_EXPIRY = 604800;

/**
 * IMPORTANT: Supabase Storage Policies
 *
 * For production use, you should set up the following policies in your Supabase dashboard:
 *
 * 1. For the "property-images" bucket:
 *    - INSERT: auth.uid() IS NOT NULL (only authenticated users can upload)
 *    - SELECT: true (anyone can view images)
 *    - UPDATE: auth.uid() = owner_id (only the owner can update)
 *    - DELETE: auth.uid() = owner_id (only the owner can delete)
 *
 * 2. Make sure the bucket is set to public access if you want to use public URLs
 *    - This is required for Next.js Image component to work without a proxy
 *
 * 3. If you're using RLS (Row Level Security), ensure your tables have appropriate policies
 *    - For example, link images to users with a user_id column
 */

/**
 * Checks if the Supabase Storage bucket exists and is accessible
 * @param bucket The storage bucket name to check
 * @returns True if the bucket exists and is accessible
 */
export async function checkBucketAccess(
  bucket: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();

    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn(
        "User is not authenticated. This may affect bucket access if RLS is enabled."
      );
    }

    console.log(`Attempting to check bucket access for "${bucket}"...`);

    // Try multiple methods to check bucket access

    // Method 1: Try to get the bucket details
    try {
      // Just try to get the public URL of a test file
      // This doesn't actually check if the file exists, just if the bucket is valid
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl("test-access.txt");
      console.log("Bucket appears to be valid based on public URL generation");
    } catch (error) {
      console.warn("Could not generate public URL for bucket test", error);
      // Continue to next method
    }

    // Method 2: Try to list files in the bucket
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list("", { limit: 1 }); // Just try to list one file to minimize data transfer

      if (listError) {
        console.warn(`Could not list files in bucket "${bucket}":`, listError);
        // Don't return false yet, we'll try one more method
      } else {
        console.log(
          `Successfully listed files in bucket "${bucket}". Found ${
            files?.length || 0
          } files.`
        );
        return true;
      }
    } catch (listError) {
      console.warn("Error when trying to list files:", listError);
      // Continue to next method
    }

    // Method 3: Try to check if we can upload a tiny test file
    try {
      // Create a tiny test file
      const testFile = new Blob(["test"], { type: "text/plain" });
      const testFileName = `access-test-${Date.now()}.txt`;

      // Try to upload it
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(testFileName, testFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.warn(
          `Could not upload test file to bucket "${bucket}":`,
          uploadError
        );

        // Check for specific errors
        if (
          uploadError.message.includes("Permission denied") ||
          uploadError.message.includes("row-level security") ||
          uploadError.message.includes("policy")
        ) {
          console.error(
            "Permission denied when accessing bucket. Check your bucket policies."
          );
        } else if (
          uploadError.message.includes("does not exist") ||
          uploadError.message.includes("not found")
        ) {
          console.error(`Bucket "${bucket}" does not exist.`);
        }

        return false;
      }

      // Clean up the test file
      await supabase.storage.from(bucket).remove([testFileName]);
      console.log(`Successfully tested upload access to bucket "${bucket}"`);
      return true;
    } catch (uploadError) {
      console.error("Error testing upload access:", uploadError);
      return false;
    }

    // If all methods failed, return false
    return false;
  } catch (error) {
    console.error("Error checking bucket access:", error);
    return false;
  }
}

/**
 * Uploads an image to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param options Additional options for the upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string = DEFAULT_BUCKET,
  options?: {
    /** Custom path prefix to organize files (e.g., "users/123/") */
    pathPrefix?: string;
    /** Whether to prefer public URLs over signed URLs */
    preferPublicUrl?: boolean;
  }
): Promise<string> {
  try {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      throw new Error(
        `Invalid file type: ${file.type}. Only images are allowed.`
      );
    }

    // Check file size (limit to 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error(
        `File size exceeds limit of 5MB. Current size: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
    }

    const supabase = createClientComponentClient();

    // Create a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = options?.pathPrefix
      ? `${options.pathPrefix}${fileName}`
      : fileName;

    console.log(`Attempting to upload file to ${bucket}/${filePath}`);
    console.log(
      `File details: name=${file.name}, type=${file.type}, size=${(
        file.size / 1024
      ).toFixed(2)}KB`
    );

    // Check authentication status
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn(
        "User is not authenticated. Upload may fail if RLS is enabled."
      );
    }

    // Check if bucket exists and try to create it if it doesn't
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucket);

      if (!bucketExists) {
        console.log(`Bucket "${bucket}" not found, attempting to create it...`);
        const { error: createError } = await supabase.storage.createBucket(
          bucket,
          {
            public: true, // Make the bucket public
          }
        );

        if (createError) {
          console.error(`Failed to create bucket "${bucket}":`, createError);

          // Check for specific permission errors
          if (createError.message.includes("Permission denied")) {
            throw new Error(
              "You don't have permission to create buckets. Please contact your administrator."
            );
          }
        } else {
          console.log(`Successfully created bucket "${bucket}"`);
        }
      }
    } catch (bucketError) {
      console.warn("Error checking/creating bucket:", bucketError);
      // Continue anyway, the upload might still work
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type, // Explicitly set content type
      });

    if (error) {
      console.error("Supabase storage error:", error);

      // Provide more specific error messages
      if (
        error.message.includes("Permission denied") ||
        error.message.includes("row-level security")
      ) {
        throw new Error(
          "Permission denied. Check your storage bucket policies and ensure you're authenticated."
        );
      } else if (error.message.includes("JWT")) {
        throw new Error("Authentication error. You may need to sign in again.");
      } else if (error.message.includes("Bucket not found")) {
        throw new Error(
          `Bucket "${bucket}" not found. Please create it in the Supabase dashboard first.`
        );
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log("File uploaded successfully. Path:", filePath);

    // Add a small delay to ensure the file is processed by Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

    // Get the direct Supabase URL for Next.js Image compatibility
    // This is the preferred method for production use
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicUrlData && publicUrlData.publicUrl) {
      console.log("Using direct Supabase URL for Next.js Image compatibility");
      return publicUrlData.publicUrl;
    }

    // Use our proxy API to avoid CORS issues - only if direct URL fails
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const proxyUrl = `${origin}/api/supabase-proxy?path=${encodeURIComponent(
        filePath
      )}&bucket=${encodeURIComponent(bucket)}`;
      console.log(`Generated proxy URL for uploaded file: ${proxyUrl}`);
      return proxyUrl;
    }

    // If all URL methods fail, return a constructed URL
    // This is a last resort fallback
    const projectRef =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
        /https:\/\/(.*?)\.supabase/
      )?.[1] || "your-project-ref";
    const constructedUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${filePath}`;
    console.log("Using constructed URL as last resort:", constructedUrl);
    return constructedUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Extracts the file path from a Supabase Storage URL
 * @param url The URL of the image
 * @returns The file path within the bucket
 */
export function extractFilePathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Handle different URL formats
    if (url.includes("/storage/v1/object/public/")) {
      // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
      const pathParts = urlObj.pathname.split("/storage/v1/object/public/");
      if (pathParts.length > 1) {
        const bucketAndPath = pathParts[1];
        const bucketPathParts = bucketAndPath.split("/");

        // Remove bucket name from path and join the rest
        if (bucketPathParts.length > 1) {
          return bucketPathParts.slice(1).join("/");
        }
      }
    } else if (url.includes("/storage/v1/object/sign/")) {
      // Format: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[filename]?token=...
      const pathParts = urlObj.pathname.split("/storage/v1/object/sign/");
      if (pathParts.length > 1) {
        const bucketAndPath = pathParts[1];
        const bucketPathParts = bucketAndPath.split("/");

        // Remove bucket name from path and join the rest
        if (bucketPathParts.length > 1) {
          return bucketPathParts.slice(1).join("/");
        }
      }
    } else {
      // Fallback to simple extraction
      const pathSegments = urlObj.pathname.split("/");
      return pathSegments[pathSegments.length - 1];
    }

    throw new Error(`Could not extract file path from URL: ${url}`);
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    // Fallback to using the last segment of the URL
    const segments = url.split("/");
    return segments[segments.length - 1];
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param url The URL of the image to delete
 * @param bucket The storage bucket name
 */
export async function deleteImage(
  url: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  try {
    if (!url) {
      throw new Error("No URL provided for deletion");
    }

    const supabase = createClientComponentClient();

    // Extract the file path from the URL
    const filePath = extractFilePathFromUrl(url);

    if (!filePath) {
      throw new Error(`Could not extract file path from URL: ${url}`);
    }

    console.log(`Attempting to delete file: ${bucket}/${filePath}`);

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Supabase storage delete error:", error);

      // Provide more specific error messages
      if (error.message.includes("Permission denied")) {
        throw new Error(
          "Permission denied. Check your storage bucket policies."
        );
      } else if (error.message.includes("JWT")) {
        throw new Error("Authentication error. You may need to sign in again.");
      } else if (error.message.includes("not found")) {
        throw new Error(`File not found: ${filePath}`);
      } else {
        throw new Error(`Delete failed: ${error.message}`);
      }
    }

    console.log("Delete successful");
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

/**
 * Gets a signed URL for a file in Supabase Storage
 * @param filePath The path of the file within the bucket
 * @param bucket The storage bucket name
 * @param expiresIn How long the signed URL should be valid for (in seconds)
 * @returns The signed URL of the file
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = DEFAULT_BUCKET,
  expiresIn: number = SIGNED_URL_EXPIRY
): Promise<string> {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      throw error;
    }

    if (!data || !data.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

/**
 * Gets the public URL for a file in Supabase Storage
 * Note: This may not work if the bucket requires authentication
 * @param filePath The path of the file within the bucket
 * @param bucket The storage bucket name
 * @returns The public URL of the file
 */
export function getPublicUrl(
  filePath: string,
  bucket: string = DEFAULT_BUCKET
): string {
  try {
    // First try the direct Supabase URL
    const supabase = createClientComponentClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Use our proxy API to avoid CORS issues
      const origin = window.location.origin;
      const proxyUrl = `${origin}/api/supabase-proxy?path=${encodeURIComponent(
        filePath
      )}&bucket=${encodeURIComponent(bucket)}`;
      console.log(`Generated proxy URL: ${proxyUrl}`);
      return proxyUrl;
    }

    return data.publicUrl;
  } catch (error) {
    console.error("Error getting public URL:", error);
    throw error;
  }
}
