import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminAuth, getAdminDB } from "@/db/firebaseAdmin";

export async function GET(request: Request) {
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
    
    // console.log("Admin verified:", uid);

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "Pending"; // Default to Pending if not specified
    // console.log("Status filter:", status);
    
    // Get payments based on status filter (default to Pending for admins)
    let paymentsSnap;
    if (["Completed", "Pending", "Ongoing"].includes(status)) {
      paymentsSnap = await db.collection("payments")
        .where("paymentStatus", "==", status)
        .get();
    } else {
      // If invalid status is provided, default to Pending
      paymentsSnap = await db.collection("payments")
        .where("paymentStatus", "==", "Pending")
        .get();
    }
    
    // console.log(`Found ${paymentsSnap.size} payments with status: ${status}`);
    
    // Extract event IDs from the payments to fetch only relevant events
    const eventIds = paymentsSnap.docs.map(doc => doc.data().eventId).filter(Boolean);
    // console.log("Event IDs to fetch:", eventIds);
    
    // Only fetch events that are referenced in the payments
    const eventMap = new Map();
    
    // Only proceed if there are event IDs to fetch
    if (eventIds.length > 0) {
      // Since we might have duplicate event IDs, let's deduplicate them first
      const uniqueEventIds = [...new Set(eventIds)];
    //   console.log(`Fetching ${uniqueEventIds.length} unique events`);
      
      // Fetch each event individually for simplicity and reliability
      for (const eventId of uniqueEventIds) {
        try {
          const eventDoc = await db.collection("events").doc(eventId).get();
          
          if (eventDoc.exists) {
            const data = eventDoc.data() || {};
            eventMap.set(eventId, {
              title: data.title || "",
              count: data.count || 0,
              price: Number(data.price) || 0,
              images: Array.isArray(data.images) && data.images.length > 0 ? [data.images[0]] : [],
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "",
            });
          } else {
            console.log(`Event with ID ${eventId} not found`);
          }
        } catch (error) {
          console.error(`Error fetching event ${eventId}:`, error);
        }
      }
      
    //   console.log(`Successfully fetched ${eventMap.size} events out of ${uniqueEventIds.length} unique referenced events`);
    }
    
    // Transform payment data
    const payments = paymentsSnap.docs.map(doc => {
      const paymentData = doc.data();
      const eventId = paymentData.eventId || "";
      const eventData = eventMap.get(eventId) || {};
      
      // Debug information for each payment
    //   console.log(`Processing payment ${doc.id} with eventId ${eventId}`);
    //   console.log(`Event data found:`, eventData ? "Yes" : "No");
      
      return {
        id: doc.id,
        eventId: eventId,
        organizerId: paymentData.organizerId || "",
        paymentStatus: paymentData.paymentStatus || "Ongoing",
        // Format createdAt from timestamp if exists
        createdAt: paymentData.createdAt?.toDate ? paymentData.createdAt.toDate().toISOString() : new Date().toISOString(),
        // Merge with event data
        eventName: eventData.title || "Unknown Event",
        participantCount: eventData.count || 0,
        ticketPrice: eventData.price || 0,
        images: eventData.images || [],
      };
    });
    
    // console.log(`Returning ${payments.length} processed payments to client`);
    return NextResponse.json({ payments });
  } catch (error) {
    const details = typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error);
    return NextResponse.json({ error: "Failed to fetch payments", details }, { status: 500 });
  }
}