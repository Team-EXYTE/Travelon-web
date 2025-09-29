import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    await initAdmin();
    const adminDB = getAdminDB();

    // Get the boost request
    const requestDoc = await adminDB
      .collection("boostRequests")
      .doc(requestId)
      .get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { message: "Boost request not found" },
        { status: 404 }
      );
    }

    const requestData = requestDoc.data();

    if (requestData?.status === "approved") {
      return NextResponse.json(
        { message: "Request already approved" },
        { status: 400 }
      );
    }

    // Get event details
    const eventId = requestData?.eventId;
    let eventData;

    try {
      const eventDoc = await adminDB.collection("events").doc(eventId).get();
      if (!eventDoc.exists) {
        return NextResponse.json(
          { message: "Event not found" },
          { status: 404 }
        );
      }

      eventData = eventDoc.data();

      // Mark event as boosted
      await adminDB
        .collection("events")
        .doc(eventId)
        .update({
          isBoosted: true,
          boostApprovedAt: new Date().toISOString(),
        });
    } catch (error) {
      console.error("Error fetching or updating event:", error);
      return NextResponse.json(
        { message: "Failed to update event boost status" },
        { status: 500 }
      );
    }

    // Update the request status
    await adminDB.collection("boostRequests").doc(requestId).update({
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: "admin", // Ideally this would be the actual admin ID
    });

    // If this request has a payment, update the payment record too
    if (requestData?.paymentId) {
      try {
        await adminDB
          .collection("eventBoostPayments")
          .doc(requestData.paymentId)
          .update({
            boostRequestStatus: "approved",
            boostApprovedAt: new Date().toISOString(),
          });
      } catch (error) {
        console.error("Error updating payment record:", error);
      }
    }

    // Send SMS notifications to subscribed users
    try {
      // Get all traveller users with maskedSubscriberId
      const travellerSnapshot = await adminDB
        .collection("users-travellers")
        .where("maskedSubscriberId", "!=", null)
        .get();

      if (!travellerSnapshot.empty) {
        const subscribers = travellerSnapshot.docs.map(
          (doc) => doc.data().maskedSubscriberId
        );

        // If we have subscribers, send SMS notification
        if (subscribers.length > 0) {
          // Prepare SMS message
          const eventTitle = eventData?.title || "event";
          const eventLocation = eventData?.location || "";
          const eventDate = eventData?.date
            ? new Date(
                typeof eventData.date === "object" &&
                "seconds" in eventData.date
                  ? eventData.date.seconds * 1000
                  : eventData.date
              ).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "";

          const message = `New Featured Event: ${eventTitle} at ${eventLocation} on ${eventDate}. Don't miss out! Check Travelon for details.`;

          // Send SMS via mSpace API
          const smsResponse = await fetch("https://api.mspace.lk/sms/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
              version: "1.0",
              applicationId: process.env.MSPACE_APP_ID,
              password: process.env.MSPACE_PASSWORD,
              message,
              destinationAddresses: subscribers,
              sourceAddress: "Travelon",
              encoding: "0",
            }),
          });

          const smsResult = await smsResponse.json();
          console.log("SMS notification result:", smsResult);

          // Record notification in database
          await adminDB.collection("notifications").add({
            type: "boost_approved",
            eventId,
            message,
            sentTo: subscribers.length,
            sentAt: new Date().toISOString(),
            status: smsResponse.ok ? "sent" : "failed",
            response: smsResult,
          });
        }
      }
    } catch (smsError) {
      console.error("Error sending SMS notifications:", smsError);
      // We'll still return success even if SMS fails
    }

    return NextResponse.json({
      message: "Boost request approved successfully",
      notificationSent: true,
    });
  } catch (error: any) {
    console.error("Error approving boost request:", error);
    return NextResponse.json(
      { message: "Failed to approve boost request" },
      { status: 500 }
    );
  }
}
