import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

/**
 * @swagger
 * /api/mspace/otp/request:
 *   post:
 *     summary: Request an OTP from mSpace
 *     description: Sends a request to mSpace API to generate and send an OTP to the provided phone number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The phone number to send OTP to
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Clean and standardize phone number to 94XXXXXXXXX format
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Convert to standard 94XXXXXXXXX format
    if (cleanPhone.startsWith("0")) {
      // If starts with 0, replace with 94
      cleanPhone = "94" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("94")) {
      // If doesn't start with 94, add it to the last 9 digits
      cleanPhone = "94" + cleanPhone.substring(Math.max(0, cleanPhone.length - 9));
    }

    // Format phone number for mSpace API
    const formattedPhone = `tel:${cleanPhone}`;

    // Initialize Firebase
    await initAdmin();
    const adminDB = getAdminDB();

    // Check if already subscribed
    try {
      const userQuery = await adminDB
        .collection("users")
        .where("phoneNumber", "==", cleanPhone)
        .where("subscriptionStatus", "==", "subscribed")
        .limit(1)
        .get();

      if (!userQuery.empty) {
        return NextResponse.json(
          {
            success: false,
            error: "This number is already subscribed",
            code: "ALREADY_SUBSCRIBED",
          },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error("Error checking subscription status:", dbError);
    }

    // Generate a unique reference for this subscription attempt
    const subscriptionId = uuidv4();
    const sessionId = uuidv4(); // Generate a unique session ID for tracking

    // Call mSpace API to request OTP
    const response = await fetch(`${process.env.MSPACE_API_URL}/otp/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        applicationId: process.env.MSPACE_APP_ID,
        password: process.env.MSPACE_PASSWORD,
        subscriberId: formattedPhone,
        applicationHash: process.env.MSPACE_APP_HASH || "travelon",
        applicationMetaData: {
          client: "WEBAPP",
          device: "Web Browser",
          os: "Any",
          appCode:
            process.env.MSPACE_APP_CODE || "https://travelon-v2.run.place",
        },
      }),
    });

    const result = await response.json();

    if (result.statusCode !== "S1000") {
      return NextResponse.json(
        {
          success: false,
          error: result.statusDetail || "Failed to send OTP",
        },
        { status: 400 }
      );
    }

    // Store OTP data in Firebase
    try {
      // Create an OTP session record
      await adminDB
        .collection("otpSessions")
        .doc(sessionId)
        .set({
          phone: cleanPhone,
          formattedPhone,
          referenceNo: result.referenceNo,
          subscriptionId,
          status: "pending",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 minutes expiry
          attempts: 0,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        });

      // Initialize subscription tracking
      await adminDB.collection("subscriptions").add({
        phone: cleanPhone,
        formattedPhone,
        status: "pending",
        referenceNo: result.referenceNo,
        subscriptionId,
        sessionId, // Link to the OTP session
        createdAt: new Date().toISOString(),
        attempts: 0,
      });

      // Update user record if exists
      const userQuery = await adminDB
        .collection("users")
        .where("phoneNumber", "==", cleanPhone)
        .limit(1)
        .get();

      if (!userQuery.empty) {
        await userQuery.docs[0].ref.update({
          lastOtpRequestAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (dbError) {
      console.error("Error storing OTP session data:", dbError);
      // Continue with the response even if database storage fails
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      referenceNo: result.referenceNo,
      sessionId,
      subscriptionId,
    });
  } catch (error: any) {
    console.error("Error in OTP request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send OTP",
        details: error.response?.data?.statusDetail || error.message,
      },
      { status: 500 }
    );
  }
}
