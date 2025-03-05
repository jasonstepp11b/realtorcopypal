import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "@/lib/supabase/corsHeaders";

// Default bucket name
const DEFAULT_BUCKET = "property-images";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * GET handler for proxying Supabase storage requests
 * This route will fetch the file from Supabase and return it with proper CORS headers
 */
export async function GET(request: NextRequest) {
  try {
    // Get the file path from the URL
    const url = new URL(request.url);
    const filePath = url.searchParams.get("path");
    const bucket = url.searchParams.get("bucket") || DEFAULT_BUCKET;

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Proxy request for file: ${bucket}/${filePath}`);

    // First try to get a signed URL
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (!signedError && signedData?.signedUrl) {
      // Fetch the file using the signed URL
      const fileResponse = await fetch(signedData.signedUrl);

      if (!fileResponse.ok) {
        console.error(
          `Failed to fetch file using signed URL: ${fileResponse.status}`
        );
        // Fall back to public URL
      } else {
        // Return the file with CORS headers
        const blob = await fileResponse.blob();
        const headers = new Headers();

        // Copy original headers
        fileResponse.headers.forEach((value, key) => {
          headers.set(key, value);
        });

        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });

        return new NextResponse(blob, {
          status: 200,
          headers,
        });
      }
    }

    // Fall back to public URL if signed URL fails
    const { data: publicData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicData?.publicUrl) {
      // Fetch the file using the public URL
      const fileResponse = await fetch(publicData.publicUrl);

      if (!fileResponse.ok) {
        return NextResponse.json(
          { error: `Failed to fetch file: ${fileResponse.status}` },
          { status: fileResponse.status, headers: corsHeaders }
        );
      }

      // Return the file with CORS headers
      const blob = await fileResponse.blob();
      const headers = new Headers();

      // Copy original headers
      fileResponse.headers.forEach((value, key) => {
        headers.set(key, value);
      });

      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new NextResponse(blob, {
        status: 200,
        headers,
      });
    }

    return NextResponse.json(
      { error: "File not found" },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in supabase-proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
