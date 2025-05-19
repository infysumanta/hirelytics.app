import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/user";
import { auth } from "@/auth";
import { z } from "zod";
import mongoose from "mongoose";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// Validation schema for update
const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent disabling admin users (including self)
    if (user.role === "admin" && validatedData.isActive === false) {
      return NextResponse.json(
        { error: "Cannot disable admin users" },
        { status: 403 },
      );
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true },
    ).select("-password");

    // Return updated user data
    return NextResponse.json({
      user: {
        id: updatedUser?._id.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        isActive: updatedUser?.isActive,
        updatedAt: updatedUser?.updatedAt,
      },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
