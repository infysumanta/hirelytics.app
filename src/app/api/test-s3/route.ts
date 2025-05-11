import { NextResponse } from "next/server";
import { checkBucketAccess } from "@/lib/check-bucket";

export async function GET() {
  try {
    const result = await checkBucketAccess();

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Successfully connected to S3 bucket",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to connect to S3 bucket. Check server logs for details.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error checking bucket access:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking bucket access",
      },
      { status: 500 },
    );
  }
}
