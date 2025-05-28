import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Wishlist from "@/models/wishlist";
import { z } from "zod";
import { Resend } from "resend";
import { auth } from "@/auth";

// Define wishlist schema for validation
const wishlistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  reason: z.string().optional(),
});

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const { name, email, reason } = wishlistSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Check if entry already exists
    const existingEntry = await Wishlist.findOne({ email });

    if (existingEntry) {
      return NextResponse.json(
        { message: "Your email is already in our waitlist" },
        { status: 200 },
      );
    }

    // Create new wishlist entry
    await Wishlist.create({
      name,
      email,
      reason,
    });

    // Send notification emails if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      console.log("Sending notification emails...");

      // Import email rendering utilities
      const { renderAdminNotificationEmail, renderWaitlistConfirmationEmail } =
        await import("@/lib/email/render");

      try {
        const submittedAt = new Date();

        // Send notification to admin
        if (process.env.ADMIN_EMAIL) {
          const adminSend = await resend.emails.send({
            from: "Hirelytics <notification@hirelytics.app>",
            to: process.env.ADMIN_EMAIL,
            subject: "New Hirelytics Waitlist Submission",
            html: await renderAdminNotificationEmail({
              name,
              email,
              reason,
              submittedAt,
            }),
          });
          console.log("Notification email sent:", adminSend);
        }

        // Send confirmation email to user
        const wishlistsend = await resend.emails.send({
          from: "Hirelytics <wishlist@hirelytics.app>",
          to: email,
          subject: "Welcome to the Hirelytics Waitlist",
          html: await renderWaitlistConfirmationEmail(name),
        });
        console.log("Confirmation email sent:", wishlistsend);
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Continue processing even if email fails
      }
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Thank you! Your information has been added to our waitlist.",
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Wishlist submission error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// GET endpoint for admin to fetch wishlist entries
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters for pagination and search
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Build query for search
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { reason: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Wishlist.countDocuments(query);

    // Get wishlist entries with pagination
    const wishlistEntries = await Wishlist.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return wishlist entries with pagination metadata
    return NextResponse.json({
      wishlistEntries: wishlistEntries.map((entry) => ({
        id: entry._id.toString(),
        name: entry.name,
        email: entry.email,
        reason: entry.reason,
        createdAt: entry.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist entries" },
      { status: 500 },
    );
  }
}
