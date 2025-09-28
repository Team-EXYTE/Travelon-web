import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminAuth, getAdminDB } from "@/db/firebaseAdmin";

export async function PATCH(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  await initAdmin();
  const db = getAdminDB();
  try {
    // Authenticate admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    // console.log("Decoded UID:", uid);
    
    // Get admin status
    const userDoc = await db.collection("users").doc(uid).get();
    // console.log("User doc exists:", userDoc.exists);
    
    if (!userDoc.exists) {
      console.log("User does not exist in the database");
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    
    const userData = userDoc.data();
    // console.log("User data:", userData);
    // console.log("Admin status:", userData?.isAdmin);
    
    // if (userData?.isAdmin !== true) {
    //   console.log("User is not an admin");
    //   return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    // }
    
    // Parse the request body
    const body = await request.json();
    const { paymentStatus } = body;
    
    if (!paymentStatus || !["Completed", "Pending", "Ongoing"].includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    
    const paymentId = params.paymentId;
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }
    
    // Update payment status in Firestore
    const paymentRef = db.collection("payments").doc(paymentId);
    const paymentDoc = await paymentRef.get();
    
    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    
    await paymentRef.update({
      paymentStatus,
      updatedAt: new Date(),
      updatedBy: uid
    });
    
    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`
    });
    
  } catch (error) {
    const details = typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error);
    return NextResponse.json({ error: "Failed to update payment status", details }, { status: 500 });
  }
}