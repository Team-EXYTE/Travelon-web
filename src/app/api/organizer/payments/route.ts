import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminAuth, getAdminDB } from "@/db/firebaseAdmin";
import { col } from "motion/react-client";

// Use events collection for payments data
const EVENTS_COLLECTION = "events";

export async function GET(request: Request) {
	await initAdmin();
	const db = getAdminDB();
	try {
		// Authenticate organizer via session cookie
		const sessionCookie = (await cookies()).get("session")?.value;
		if (!sessionCookie) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		const adminAuth = getAdminAuth();
		const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
		const organizerUid = decodedClaims.uid;
		if (!organizerUid) {
			return NextResponse.json({ error: "Organizer not found in session" }, { status: 401 });
		}
		const ref = db.collection(EVENTS_COLLECTION);
		const snapshot = await ref.where("organizerId", "==", organizerUid).get();
		// For each event, fetch paymentStatus from payments collection using eventId
		// Fetch all payments for this organizer
		const paymentsCollection = db.collection("payments");
		const paymentsSnap = await paymentsCollection.where("organizerId", "==", organizerUid).get();
		// Build a map of eventId to paymentStatus
		const paymentStatusMap: Record<string, string> = {};
		paymentsSnap.forEach(doc => {
			const data = doc.data();
			if (data.eventId && data.paymentStatus) {
				paymentStatusMap[data.eventId] = data.paymentStatus;
				// console.log(`Mapped payment for event ${data.eventId}: ${data.paymentStatus}`);
			}
		});
		
		// console.log("Payment mappings:", JSON.stringify(paymentStatusMap));

		// Map each event row to its payment status
		const payments = snapshot.docs.map(doc => {
			const data = doc.data();
			const paymentStatus = paymentStatusMap[doc.id] || "Ongoing";
			return {
				id: doc.id,
				eventName: data.title || "",
				participantCount: data.count || 0,
				ticketPrice: Number(data.price) || 0,
				paymentStatus,
				createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "",
				images: Array.isArray(data.images) && data.images.length > 0 ? [data.images[0]] : [],
			};
		});
        // console.log("Payments fetched:", payments);
		return NextResponse.json({ payments });
	} catch (error) {
		const details = typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error);
		return NextResponse.json({ error: "Failed to fetch payments", details }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	await initAdmin();
	const db = getAdminDB();
	try {
		// Authenticate organizer via session cookie
		const sessionCookie = (await cookies()).get("session")?.value;
		if (!sessionCookie) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		const adminAuth = getAdminAuth();
		const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
		const organizerUid = decodedClaims.uid;
		if (!organizerUid) {
			return NextResponse.json({ error: "Organizer not found in session" }, { status: 401 });
		}

		// Parse request body to get eventId
		const body = await request.json();
		const { eventId } = body;

		if (!eventId) {
			return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
		}

		// Find the payment document with this eventId and organizerId
		const paymentsCollection = db.collection("payments");
		const paymentQuery = await paymentsCollection
			.where("eventId", "==", eventId)
			.where("organizerId", "==", organizerUid)
			.limit(1)
			.get();

		if (paymentQuery.empty) {
			// If payment document doesn't exist, create a new one
			await paymentsCollection.add({
				eventId,
				organizerId: organizerUid,
				paymentStatus: "Pending",
				updatedAt: new Date()
			});
		} else {
			// If payment document exists, update its status
			const paymentDoc = paymentQuery.docs[0];
			await paymentDoc.ref.update({
				paymentStatus: "Pending",
				updatedAt: new Date()
			});
		}

		return NextResponse.json({ 
			success: true,
			message: "Payment status updated to Pending" 
		});
	} catch (error) {
		const details = typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error);
		return NextResponse.json({ error: "Failed to update payment status", details }, { status: 500 });
	}
}
