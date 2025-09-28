import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

/**
 * @swagger
 * /api/mspace/otp/verify:
 *   post:
 *     summary: Verify an OTP with mSpace
 *     description: Verifies the OTP entered by the user with mSpace API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - sessionId
 *             properties:
 *               otp:
 *                 type: string
 *                 description: The OTP entered by the user
 *               sessionId:
 *                 type: string
 *                 description: The session ID returned from OTP request
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or session ID
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    const { otp, sessionId } = body;

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "OTP is required" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Initialize Firebase
    await initAdmin();
    const adminDB = getAdminDB();

    // Retrieve OTP session from Firebase
    const sessionDoc = await adminDB
      .collection("otpSessions")
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP session expired or invalid. Please request a new OTP.",
          code: "INVALID_OTP_SESSION",
        },
        { status: 400 }
      );
    }

    const sessionData = sessionDoc.data();

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid session data. Please request a new OTP.",
          code: "INVALID_SESSION_DATA",
        },
        { status: 400 }
      );
    }

    // Check if session is expired
    if (new Date() > new Date(sessionData.expiresAt)) {
      await sessionDoc.ref.update({
        status: "expired",
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "OTP has expired. Please request a new OTP.",
          code: "OTP_EXPIRED",
        },
        { status: 400 }
      );
    }

    // Check if too many attempts
    if (sessionData.attempts >= 20) {
      await sessionDoc.ref.update({
        status: "blocked",
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please request a new OTP.",
          code: "TOO_MANY_ATTEMPTS",
        },
        { status: 400 }
      );
    }

    // Increment attempt counter
    await sessionDoc.ref.update({
      attempts: sessionData.attempts + 1,
      updatedAt: new Date().toISOString(),
    });

    // Call mSpace API to verify OTP
    const response = await fetch(`${process.env.MSPACE_API_URL}/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        applicationId: process.env.MSPACE_APP_ID,
        password: process.env.MSPACE_PASSWORD,
        referenceNo: sessionData.referenceNo,
        otp: otp.toString(),
      }),
    });

    const result = await response.json();

    if (result.statusCode !== "S1000") {
      return NextResponse.json(
        {
          success: false,
          error: result.statusDetail || "OTP verification failed",
          remainingAttempts: 20 - (sessionData.attempts + 1),
        },
        { status: 400 }
      );
    }

    // Extract the masked subscriber ID from the response
    const maskedSubscriberId = result.subscriberId;
    const subscriptionStatus = result.subscriptionStatus || "PENDING";

    // Mark OTP session as verified and store the masked subscriber ID
    await sessionDoc.ref.update({
      status: "verified",
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      maskedSubscriberId, // Store the masked subscriber ID
      mspaceSubscriptionStatus: subscriptionStatus,
      mspaceResponse: result, // Store the complete response for reference
    });

    // Determine which user collection to use based on session data
    const userType = sessionData.userType || "organizer"; // Default for backward compatibility
    const userCollection = userType === "organizer" ? "users" : "users-travellers";

    // Update subscription status
    try {
      // Find the related subscription
      const subscriptionQuery = await adminDB
        .collection("subscriptions")
        .where("subscriptionId", "==", sessionData.subscriptionId)
        .limit(1)
        .get();

      if (!subscriptionQuery.empty) {
        const subscriptionDoc = subscriptionQuery.docs[0];
        await subscriptionDoc.ref.update({
          status: "verifying",
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          maskedSubscriberId, // Store the masked subscriber ID
          mspaceSubscriptionStatus: subscriptionStatus,
        });
      }

      // Update user if exists
      const userQuery = await adminDB
        .collection(userCollection)
        .where("phoneNumber", "==", sessionData.phone)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        await userQuery.docs[0].ref.update({
          phoneNumberVerified: true,
          lastOtpVerifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subscriptionStatus: "pending",
          maskedSubscriberId, 
        });
      }
    } catch (dbError) {
      console.error("Error updating verification status:", dbError);
    }

    // Return success with token for session tracking
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      subscriptionId: sessionData.subscriptionId,
      subscriberId: maskedSubscriberId, // Return the masked subscriber ID to the client
      subscriptionStatus,
      phone: sessionData.phone,
      userType: sessionData.userType || "organizer", // Return the user type
      token: sessionId, // Return the session ID as a token for client-side tracking
    });
  } catch (error: any) {
    console.error("Error in OTP verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify OTP",
        details: error.response?.data?.statusDetail || error.message,
      },
      { status: 500 }
    );
  }
}
