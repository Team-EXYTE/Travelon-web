import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

export async function GET(request: Request) {
  try {
    await initAdmin();
    const adminDB = getAdminDB();

    // Get all boost requests
    const requestsSnapshot = await adminDB
      .collection("boostRequests")
      .orderBy("requestedAt", "desc")
      .get();

    if (requestsSnapshot.empty) {
      return NextResponse.json({ requests: [] });
    }

    // Process requests and get additional data
    const requestsPromises = requestsSnapshot.docs.map(async (doc) => {
      const requestData = doc.data();
      const requestId = doc.id;

      // Get event details
      let eventData = null;
      let eventImage = null;
      let eventLocation = null;
      let eventDate = null;

      try {
        const eventDoc = await adminDB
          .collection("events")
          .doc(requestData.eventId)
          .get();
        if (eventDoc.exists) {
          eventData = eventDoc.data();
          eventImage = eventData?.images?.[0] || null;
          eventLocation = eventData?.location || null;
          eventDate = eventData?.date
            ? new Date(
                typeof eventData.date === "object" &&
                "seconds" in eventData.date
                  ? eventData.date.seconds * 1000
                  : eventData.date
              ).toISOString()
            : null;
        }
      } catch (error) {
        console.error(
          `Error fetching event data for ${requestData.eventId}:`,
          error
        );
      }

      // Get organizer details
      let organizerName = null;
      try {
        const organizerDoc = await adminDB
          .collection("users")
          .doc(requestData.userId)
          .get();
        if (organizerDoc.exists) {
          const organizerData = organizerDoc.data();
          organizerName =
            organizerData?.firstName && organizerData?.lastName
              ? `${organizerData.firstName} ${organizerData.lastName}`
              : organizerData?.orgName || organizerData?.username || "Unknown";
        }
      } catch (error) {
        console.error(
          `Error fetching organizer data for ${requestData.userId}:`,
          error
        );
      }

      // Get payment details if available
      let paymentData = null;
      if (requestData.paymentId) {
        try {
          const paymentDoc = await adminDB
            .collection("eventBoostPayments")
            .doc(requestData.paymentId)
            .get();
          if (paymentDoc.exists) {
            paymentData = paymentDoc.data();
          }
        } catch (error) {
          console.error(
            `Error fetching payment data for ${requestData.paymentId}:`,
            error
          );
        }
      }

      return {
        id: requestId,
        ...requestData,
        eventImage,
        eventLocation,
        eventDate,
        organizerName,
        paymentDetails: paymentData,
      };
    });

    const requests = await Promise.all(requestsPromises);

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Error getting boost requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch boost requests" },
      { status: 500 }
    );
  }
}
