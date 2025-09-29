import { NextResponse } from "next/server";
import { initAdmin, getAdminDB, getAdminAuth } from "@/db/firebaseAdmin";
import { cookies } from "next/headers";

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

    // FIXED: Use server-side auth verification with cookies instead of fetch
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Initialize Firebase Admin
    await initAdmin();
    const adminDB = getAdminDB();
    const auth = getAdminAuth();

    // Verify session cookie
    let userId;
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      userId = decodedClaims.uid;
    } catch (error) {
      console.error("Invalid session cookie:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
