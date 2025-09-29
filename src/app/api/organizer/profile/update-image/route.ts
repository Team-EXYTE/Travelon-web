import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

export async function POST(request: Request) {
  try {
    // Get request data
    const { profileImage } = await request.json();

    if (!profileImage) {
      return NextResponse.json(
        { error: "Profile image URL is required" },
        { status: 400 }
      );
    }

    // Get the current user ID from the auth endpoint
    const authResponse = await fetch(
      new URL("/api/auth/me", request.url).toString(),
      {
        headers: request.headers,
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const userId = authData.user?.uid;

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize Firebase Admin
    await initAdmin();
    const adminDB = getAdminDB();

    // Update user profile with the image URL
    await adminDB.collection("users").doc(userId).update({
      profileImage,
      updatedAt: new Date().toISOString(),
    });

    // Get the updated user data
    const userDoc = await adminDB.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User document not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        id: userDoc.id,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image: " + error.message },
      { status: 500 }
    );
  }
}
