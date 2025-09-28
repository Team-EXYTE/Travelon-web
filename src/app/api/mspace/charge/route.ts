import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

/**
 * @swagger
 * /api/mspace/charge:
 *   post:
 *     summary: Handle charge notifications from mSpace
 *     description: Webhook endpoint for mSpace CAAS to send charge status notifications
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notification received
 */
export async function POST(request: Request) {
  console.log("[mSpace Charge Notification] Received request");
  try {
    // Get notification data
    const notification = await request.json();
    console.log('[mSpace Charge Notification]:', JSON.stringify(notification, null, 2));

    // const {
    //   applicationId,
    //   externalTrxId,
    //   internalTrxId,
    //   statusCode,
    //   statusDetail,
    //   timeStamp,
    //   amount,
    //   currency,
    //   subscriberId,
    // } = notification;

    // // Validate notification data
    // if (!externalTrxId) {
    //   console.warn("Received charge notification without externalTrxId");
    // }

    // try {
    //   // Initialize Firebase Admin
    //   await initAdmin();
    //   const adminDB = getAdminDB();

    //   // Store notification in Firestore
    //   await adminDB.collection("chargeNotifications").add({
    //     externalTrxId,
    //     internalTrxId,
    //     subscriberId,
    //     statusCode,
    //     statusDetail,
    //     amount,
    //     currency,
    //     timeStamp: timeStamp || new Date().toISOString(),
    //     receivedAt: new Date().toISOString(),
    //     rawData: notification,
    //   });

    //   // Update payment status in transactions collection if exists
    //   if (externalTrxId) {
    //     const txQuery = await adminDB
    //       .collection("transactions")
    //       .where("externalTrxId", "==", externalTrxId)
    //       .limit(1)
    //       .get();

    //     if (!txQuery.empty) {
    //       const txDoc = txQuery.docs[0];
    //       await txDoc.ref.update({
    //         status: statusCode === "S1000" ? "confirmed" : "failed",
    //         statusCode,
    //         statusDetail,
    //         updatedAt: new Date().toISOString(),
    //         notificationReceived: true,
    //       });
    //     } else {
    //       // Create a record if we don't have one
    //       await adminDB.collection("transactions").add({
    //         externalTrxId,
    //         internalTrxId,
    //         subscriberId,
    //         amount,
    //         currency,
    //         status: statusCode === "S1000" ? "confirmed" : "failed",
    //         statusCode,
    //         statusDetail,
    //         createdAt: new Date().toISOString(),
    //         updatedAt: new Date().toISOString(),
    //         notificationData: notification,
    //       });
    //     }
    //   }

    //   console.log(
    //     `Payment notification processed for transaction ${externalTrxId}`
    //   );
    // } catch (dbError) {
    //   console.error("Error updating payment in database:", dbError);
    // }

    // Always respond with success to acknowledge receipt
    return NextResponse.json({
      statusCode: "S1000",
      statusDetail: "Charge notification received successfully",
    });
  } catch (error: any) {
    console.error("Error processing charge notification:", error);

    // Even on error, acknowledge receipt to prevent retries
    return NextResponse.json({
      statusCode: "S1000",
      statusDetail: "Notification received",
    });
  }
}
