import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

/**
 * API endpoint for submitting boost requests after payment or for free events
 */
export async function POST(request: Request) {
  try {
    const {
      eventId,
      userId,
      freeEvent = false,
      paymentId = null,
    } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    try {
      await initAdmin();
      const adminDB = getAdminDB();

      // Verify the event exists and belongs to this user
      const eventDoc = await adminDB.collection("events").doc(eventId).get();

      if (!eventDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            message: "Event not found",
          },
          { status: 404 }
        );
      }

      const eventData = eventDoc.data();
      
      if (!eventData) {
        return NextResponse.json(
          {
            success: false,
            message: "Event data is missing",
          },
          { status: 404 }
        );
      }

      if (eventData.organizerId !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "You don't have permission to boost this event",
          },
          { status: 403 }
        );
      }

      // Check if already has a pending boost request
      const existingRequests = await adminDB
        .collection("boostRequests")
        .where("eventId", "==", eventId)
        .where("status", "==", "pending")
        .get();

      if (!existingRequests.empty) {
        return NextResponse.json(
          {
            success: false,
            message: "This event already has a pending boost request",
          },
          { status: 400 }
        );
      }

      // Create boost request
      const boostRequest = {
        eventId,
        userId,
        paymentId,
        status: "pending", // pending, approved, rejected
        requestedAt: new Date().toISOString(),
        eventTitle: eventData.title,
        freeEvent,
        amount: freeEvent ? 0 : null, // Will be filled from payment if not free
      };

      const requestRef = await adminDB
        .collection("boostRequests")
        .add(boostRequest);

      return NextResponse.json({
        success: true,
        message: "Boost request submitted successfully",
        requestId: requestRef.id,
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database error: " + dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing boost request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error: " + error.message,
      },
      { status: 500 }
    );
  }
}
