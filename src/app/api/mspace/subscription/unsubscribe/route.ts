import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminDB, getAdminAuth } from "@/db/firebaseAdmin";

/**
 * @swagger
 * /api/mspace/subscription/unsubscribe:
 *   post:
 *     summary: Unsubscribe a user from a service
 *     description: Removes a user's subscription with the mSpace API using their masked subscriberId.
 *     responses:
 *       200:
 *         description: Unsubscription request processed successfully.
 *       401:
 *         description: Unauthorized - A valid user session is required.
 *       404:
 *         description: Not Found - The user or their subscription could not be found.
 *       500:
 *         description: Internal Server Error.
 */
export async function POST(request: Request) {
  try {
    // Initialize Firebase admin SDK
    await initAdmin();
    const adminDB = getAdminDB();
    const adminAuth = getAdminAuth();

    // 1. Get session cookie to securely identify the logged-in user
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in.",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    // 2. Verify the session and extract the user's email
    let userEmail: string;
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      userEmail = decodedClaims.email;

      if (!userEmail) {
        throw new Error("No email associated with this session.");
      }
    } catch (verifyError) {
      console.error("Session verification failed:", verifyError);
      return NextResponse.json(
        {
          success: false,
          error: "Your session is invalid or has expired. Please sign in again.",
          code: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    // 3. Find the user's document in Firestore using their email
    const userQuery = await adminDB
      .collection("users")
      .where("email", "==", userEmail)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "User account not found.",
          code: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // --- FIX APPLIED HERE ---
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // 4. Check if the user has a maskedSubscriberId to perform the unsubscription
    if (!userData.maskedSubscriberId) {
      return NextResponse.json(
        {
          success: false,
          error: "No active subscription found for this user to unsubscribe.",
          code: "NO_SUBSCRIPTION_ID",
        },
        { status: 404 }
      );
    }

    const maskedSubscriberId = userData.maskedSubscriberId;
    console.log(
      `Attempting to unsubscribe user: ${userEmail} with maskedSubscriberId: ${maskedSubscriberId}`
    );

    // 5. Call the mSpace API with the correct action and the masked ID
    const response = await fetch(
      `${process.env.MSPACE_API_URL}/subscription/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify({
          applicationId: process.env.MSPACE_APP_ID,
          password: process.env.MSPACE_PASSWORD,
          subscriberId: maskedSubscriberId, // Using the secure masked ID
          action: "0", // '0' is the action for unsubscription
        }),
      }
    );

    const result = await response.json();
    console.log(`mSpace unsubscribe response for ${userEmail}:`, result);

    // 6. If mSpace confirms, update your database atomically
    if (result.statusCode === "S1000") {
      const batch = adminDB.batch();

      // Update the main user document
      batch.update(userDoc.ref, {
        subscriptionStatus: "unsubscribed",
        subscriptionUpdatedAt: new Date().toISOString(),
        subscriptionEndDate: new Date().toISOString(),
      });

      // Find and update the corresponding subscription record
      const subscriptionQuery = await adminDB
        .collection("subscriptions")
        .where("maskedSubscriberId", "==", maskedSubscriberId)
        .orderBy("createdAt", "desc") 
        .limit(1)
        .get();

      if (!subscriptionQuery.empty) {
        batch.update(subscriptionQuery.docs[0].ref, {
          status: "unsubscribed",
          updatedAt: new Date().toISOString(),
          unsubscribeResponse: result,
        });
      }

      // Commit all changes to the database at once
      await batch.commit();
      console.log(`Database updated. Successfully unsubscribed user ${userEmail}`);
    } else {
      // Log an error if mSpace failed the request
      console.error(
        `mSpace failed to unsubscribe user ${userEmail}. Reason: ${result.statusDetail}`
      );
    }

    // 7. Return the result to the client
    return NextResponse.json({
      success: result.statusCode === "S1000",
      message: result.statusDetail || "Unsubscription request processed.",
      data: {
        subscriptionStatus: result.subscriptionStatus || "UNREGISTERED",
      },
    });

  } catch (error: any) {
    console.error("A critical error occurred in the unsubscription process:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}